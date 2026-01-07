import prisma from "@/lib/prisma";
import { generateNodeSummary } from "@/lib/identity/nodes/generateNodeSummary";
import { openai } from "@/lib/openai";
import { auth } from '@/lib/auth'

export async function GET(request, { params }) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const { id } = await params
        
        // fetch node with related data
        const node = await prisma.node.findUnique({
            where: { 
                id,
                userId: session.user.id
            }, 
            include: {
                topicAliases: {
                    select: {
                        id: true, 
                        topic: true
                    }
                }, 
                outgoingEdges: {
                    include: {
                        target: {
                            select: {
                                id: true, 
                                label: true, 
                                count: true
                            }
                        }
                    }, 
                    orderBy: { weight: 'desc' },
                    take: 10
                },
                incomingEdges: {
                    include: {
                        source: {
                            select: {
                                id: true,
                                label: true,
                                count: true
                            }
                        }
                    },
                    orderBy: { weight: 'desc' },
                    take: 10
                }
            }
        })

        if (!node) {
            return Response.json({ error: "Node not found" }, { status: 404 })
        }

        // get contexts
        const excerpts = node.contexts.slice(0,5)

        const uniqueEntryIds = new Set(node.contexts.map(c => c.entryId))
        
        // Use stored bullet points or generate if missing
        let bulletPoints = node.bulletPoints || []
        
        if (bulletPoints.length === 0 && node.count >= 2 && excerpts.length > 0) {
            // Generate bullet points if missing
            const excerptsText = excerpts.map((e, i) => `${i + 1}. ${e.text}`).join('\n\n')
            
            const bulletPrompt = `Read these journal excerpts about "${node.label}". Extract 3-5 short factual bullet points describing the specific moments or contexts where this appears. Use second person ("you/your") to address the writer directly.

${excerptsText}

Return only the bullet points, one per line, without numbers or dashes. Each should start with a verb or describe a specific moment. Be concise (max 12 words per point).

Examples:
- Comparing your progress to others
- Feeling "late" to becoming who you imagine
- Noticing tension between comfort and growth`

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: bulletPrompt }],
                    temperature: 0.3,
                    max_tokens: 150
                })
                
                bulletPoints = response.choices[0].message.content
                    .trim()
                    .split('\n')
                    .filter(line => line.trim().length > 0)
                    .map(line => line.replace(/^[-–—•]\s*/, '')) // Remove any bullet markers
                    .slice(0, 5)
                
                // Store them for future use
                await prisma.node.update({
                    where: { id },
                    data: { bulletPoints }
                })
            } catch (error) {
                console.error("Error generating bullet points:", error)
                // Fallback to simple extraction if LLM fails
                bulletPoints = excerpts.map(e => {
                    const text = e.excerpt || e.text
                    return text.length > 80 ? text.substring(0, 80) + '...' : text
                })
            }
        }

        //build connections summary
        const connections = {
            outgoing: node.outgoingEdges.map(edge => ({
                nodeId: edge.target.id, 
                label: edge.target.label, 
                weight: edge.weight,
                count: edge.target.count
            })),
            incoming: node.incomingEdges.map(edge => ({
                nodeId: edge.source.id, 
                label: edge.source.label, 
                weight: edge.weight,
                count: edge.source.count
            }))
        }

        // generate insights with more human, reflective language
        const generatedInsights = []
        
        // Frequency insight
        if (uniqueEntryIds.size > 3) {
            generatedInsights.push(`This comes up often in your reflections`)
        } else if (uniqueEntryIds.size === 1) {
            generatedInsights.push(`You mentioned this recently`)
        }

        // Connection insights - make them feel meaningful
        if (connections.outgoing.length > 0) {
            const topConnection = connections.outgoing[0]
            if (topConnection.weight > 3) {
                generatedInsights.push(
                    `Closely tied to how you think about **${topConnection.label}**`
                )
            } else {
                generatedInsights.push(
                    `Connected to **${topConnection.label}**`
                )
            }
        }

        if (connections.incoming.length > 1) {
            const topTwo = connections.incoming.slice(0, 2).map(c => c.label)
            generatedInsights.push(
                `Often comes up when you write about **${topTwo[0]}** and **${topTwo[1]}**`
            )
        } else if (connections.incoming.length > 0) {
            generatedInsights.push(
                `Tends to appear alongside **${connections.incoming[0].label}**`
            )
        }

        // Pattern insight based on count
        if (node.count > 5) {
            generatedInsights.push(`This is a recurring theme in your life`)
        }
        
        // summary
        const summary = {
            label: node.label,
            categories: node.categories, 
            count: node.count, 
            entryCount: uniqueEntryIds.size
        }

        // Use stored LLM summary or generate if missing
        let llmSummary = node.llmSummary
        
        // If no stored summary but node qualifies (count >= 2), generate one
        if (!llmSummary && node.count >= 2) {
            const result = await generateNodeSummary(node)
            
            // Store it for future use
            if (result) {
                await prisma.node.update({
                    where: { id },
                    data: { 
                        llmSummary: result.summary,
                        bulletPoints: result.bulletPoints
                    }
                })
                llmSummary = result.summary
                // Also update bulletPoints if they weren't already set
                if (bulletPoints.length === 0) {
                    bulletPoints = result.bulletPoints
                }
            }
        }

        return Response.json({
            summary, 
            llmSummary,
            insights: generatedInsights,
            bulletPoints,
            excerpts,
            connections
        })
    } catch (error) {
        console.error("Failed to fetch node insights:", error)
        return Response.json({error: "Failed to fetch node insights"}, {status: 500})
    }
}
