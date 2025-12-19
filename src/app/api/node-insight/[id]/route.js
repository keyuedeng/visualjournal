import { prisma } from "@/lib/prisma";
import { generateNodeSummary } from "@/lib/identity/nodes/generateNodeSummary";

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
            llmSummary = await generateNodeSummary(node)
            
            // Store it for future use
            if (llmSummary) {
                await prisma.node.update({
                    where: { id },
                    data: { llmSummary }
                })
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
