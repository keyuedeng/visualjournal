import { semanticChunk } from "../chunking/chunking";
import { extractInsight } from "../insights/extractInsight";
import { canonicaliseTopicAlias } from "../canonicalisation/canonicaliseTopicAlias";
import { createOrUpdateEdges } from "../graph/createOrUpdateEdges";
import { prisma } from "@/lib/prisma";

export async function processEntry(userId, entryId, entrybody) {
    console.log("Processing entry:", { userId, entryId, bodyLength: entrybody?.length })
    
    const chunks = await semanticChunk(entrybody)
    console.log("got chunks", chunks.length)

    const allTouchedNodes = new Set(); //track all nodes touched by this entry

    // extract insights per chunk
    for (const chunk of chunks) {
        const chunkText = chunk.text

        const analysis = await extractInsight(chunk.text);
        const topics = analysis.topics || []
        const sentiment = analysis.sentiment || 0

        await prisma.insight.create({
            data: {
                entryId,
                topics, 
                sentiment,
                chunkIndex: chunk.index
            }
        })

        const chunkNodeIds = []

        //process topics -> nodes
        for (const topic of topics) {
            const nodeId = await canonicaliseTopicAlias({
                userId, 
                rawTopic: topic,
                snippet: chunkText,
                entryId, 
                sentiment,
            })

            chunkNodeIds.push(nodeId)
            allTouchedNodes.add(nodeId)
        }

        // UPDATE EDGES
        await createOrUpdateEdges(userId, chunkNodeIds, 1)
    }
    // entry level edges - broader connections across whole entry
    const entryNodeIds = Array.from(allTouchedNodes)

    if (entryNodeIds.length > 1) {
        await createOrUpdateEdges(userId, entryNodeIds, 0.3)
    }

    return entryNodeIds
}