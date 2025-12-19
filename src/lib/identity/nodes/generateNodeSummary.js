import { openai } from "@/lib/openai"
import { prisma } from "@/lib/prisma"

export async function generateNodeSummary(node) {
    // Only generate summary if node appears 2+ times
    if (node.count < 2) {
        return null
    }

    // If node has no contexts, return null
    if (!node.contexts || node.contexts.length === 0) {
        return null
    }

    // Fetch the full node with connections if not already included
    let fullNode = node
    if (!node.outgoingEdges || !node.incomingEdges) {
        fullNode = await prisma.node.findUnique({
            where: { id: node.id },
            include: {
                outgoingEdges: {
                    include: {
                        target: {
                            select: {
                                label: true
                            }
                        }
                    },
                    orderBy: { weight: 'desc' },
                    take: 3
                },
                incomingEdges: {
                    include: {
                        source: {
                            select: {
                                label: true
                            }
                        }
                    },
                    orderBy: { weight: 'desc' },
                    take: 3
                }
            }
        })
    }

    // Get unique entry IDs from contexts
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
    
    // Calculate time span from entry dates
    const dates = entries.map(e => new Date(e.createdAt)).filter(d => !isNaN(d))
    
    let timeSpan = ""
    if (dates.length > 0) {
        const earliestDate = new Date(Math.min(...dates))
        const latestDate = new Date(Math.max(...dates))
        const daysDiff = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 0) {
            timeSpan = "today"
        } else if (daysDiff < 7) {
            timeSpan = `${daysDiff} days`
        } else if (daysDiff < 30) {
            const weeks = Math.ceil(daysDiff / 7)
            timeSpan = weeks === 1 ? "1 week" : `${weeks} weeks`
        } else {
            const months = Math.ceil(daysDiff / 30)
            timeSpan = months === 1 ? "1 month" : `${months} months`
        }
    } else {
        timeSpan = "recently"
    }

    // Get excerpts from contexts
    const contextsText = node.contexts
        .slice(0, 3)
        .map(ctx => ctx.text)
        .join("\n\n")

    // Build connections text
    const connections = [
        ...(fullNode.outgoingEdges?.map(e => e.target.label) || []),
        ...(fullNode.incomingEdges?.map(e => e.source.label) || [])
    ]
    const connections_text = connections.length > 0 ? connections.join(', ') : 'none'

    // Call OpenAI to generate summary
    const prompt = `You are reflecting on a concept from someone's personal journal.

The concept is "${node.label}".

Here are some excerpts where this concept appears:
${contextsText}

This concept is connected to: ${connections_text}

Write a 3-4 sentence reflection that:
1. Gently explains why this concept keeps showing up for you
2. Notices any repeated tensions, questions, or perspectives in how you describe it
3. Interprets the meaning behind the words, not just the topic itself

Guidelines:
- Stay closely grounded in the excerpts — do not generalise beyond what is shown
- If evidence is limited, keep interpretations tentative and specific
- Do not give advice, guidance, or conclusions
- Do not sound therapeutic, inspirational, or poetic
- Avoid phrases like "journey", "healing", "true self", or "self-acceptance"
- Use clear, simple language, like a thoughtful note you might write to yourself
- Use "you", not "they" or third person

Opening variation rule:
- Vary the opening sentence structure (e.g. focus on language, moments, tone, or context).
- Avoid starting with "In these excerpts" unless no other framing is possible.

Aim for insight over elegance. Interpret carefully, not broadly.`

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.45,
            max_tokens: 200
        })

        return completion.choices[0].message.content.trim()
    } catch (error) {
        console.error("Error generating node summary:", error)
        return null
    }
}
