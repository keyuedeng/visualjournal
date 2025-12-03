import { semanticChunk } from "../chunking";
import { extractInsight } from "../extractInsight";
import { canonicaliseTopicAlias } from "../nodes/canonicaliseTopicAlias";
import { createOrUpdateEdges } from "../graph/createOrUpdateEdges";

export async function processEntry(userId, entryId, entrybody) {
    const { chunks } = await semanticChunk(entrybody)

    const allTouchedNodes = new Set(); //track all nodes touched by this entry

    // extract insights per chunk
    for (const chunk of chunks) {
        const chunkText = chunk.text

        const analysis = await extractInsight(chunk.text);
        const topics = analysis.topics || []
        const sentiment = analysis.sentiment || 0

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
        await createOrUpdateEdges(userId, chunkNodeIds)
    }

    return Array.from(allTouchedNodes)
}