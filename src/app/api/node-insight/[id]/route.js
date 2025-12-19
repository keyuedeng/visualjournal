import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function GET(request, { params }) {
    try {
        const { id } = await params
        
        // fetch node with related data
        const node = await prisma.node.findUnique({
            where: { id }, 
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
        
        // Fetch entries to get dates
        const entries = await prisma.entry.findMany({
            where: {
                id: { in: Array.from(uniqueEntryIds) }
            },
            select: {
                id: true,
                createdAt: true
            }
        })
        
        const dates = entries.map(e => new Date(e.createdAt)).filter(d => !isNaN(d))

        let timeSpan = null
        if (dates.length > 0) {
            const oldestDate = new Date(Math.min(...dates))
            const newestDate = new Date(Math.max(...dates))
            const monthsDiff = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + (newestDate.getMonth() - oldestDate.getMonth())
            timeSpan = {
                months: monthsDiff,
                firstMention: oldestDate, 
                lastMention: newestDate
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
        
        // Time span insight
        if (timeSpan && timeSpan.months > 1) {
            generatedInsights.push(
                `You've been thinking about this for ${timeSpan.months} months now`
            )
        } else if (timeSpan && timeSpan.months === 1) {
            generatedInsights.push(`This has been on your mind this past month`)
        } else if (uniqueEntryIds.size > 3) {
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
            entryCount: uniqueEntryIds.size,
            timeSpan
        }

        // Generate LLM summary
        let llmSummary = null
        if (excerpts.length > 0) {
            const contextsText = excerpts.map(c => c.text).join('\n\n')
            const connections_text = [
                ...connections.outgoing.slice(0, 3).map(c => c.label),
                ...connections.incoming.slice(0, 3).map(c => c.label)
            ].join(', ')

            const prompt = `You are reflecting on a concept from someone's personal journal.

The concept is "${node.label}".

Here are some excerpts where this concept appears:
${contextsText}

This concept is connected to: ${connections_text}

Write a 3-4 sentence reflection that:
1. Gently explains why this concept keeps showing up for you
2. Notices any repeated tensions, questions, or perspectives in how you describe it
3. Interprets the meaning behind the language you use, not just the topic itself

Guidelines:
- Stay closely grounded in the excerpts — do not generalise beyond what is shown
- If evidence is limited, keep interpretations tentative and specific
- Do not give advice, guidance, or conclusions
- Do not sound therapeutic, inspirational, or poetic
- Avoid phrases like “journey”, “healing”, “true self”, or “self-acceptance”
- Use clear, simple language, like a thoughtful note you might write to yourself
- Use “you”, not “they” or third person

Opening variation rule:
- Vary the opening sentence structure (e.g. focus on language, moments, tone, or context).
- Avoid starting with “In these excerpts” unless no other framing is possible.

Aim for insight over elegance. Interpret carefully, not broadly.`

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    temperature: 0.45,
                    messages: [{ role: "user", content: prompt }]
                })
                llmSummary = response.choices[0].message.content
            } catch (error) {
                console.error("Failed to generate LLM summary:", error)
                // Continue without LLM summary if it fails
            }
        }

        return Response.json({
            summary, 
            llmSummary,
            insights: generatedInsights, 
            excerpts,
            connections
        })
    } catch (error) {
        console.error("Failed to fetch node insights:", error)
        return Response.json({error: "Failed to fetch node insights"}, {status: 500})
    }
}