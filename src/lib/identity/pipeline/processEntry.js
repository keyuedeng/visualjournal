import { semanticChunk } from "../chunking";
import { extractInsight } from "../extractInsight";
import { prisma } from "@/lib/prisma";

export async function processEntry(entryId, entrybody) {
    const chunks = await semanticChunk(entrybody)

    const insightRecords = []

    // extract insights per chunk
    for (let i=0; i<chunks.length; i++) {
        const chunk = chunks[i]

        const analysis = await extractInsight(chunk.text);

        //save to db
        const saved = await prisma.insight.create({
            data: {
                entryId: entryId,
                topics: analysis.topics || [],
                sentiment: analysis.sentiment || 0,
                chunkIndex: i+1,
            },
        })

        insightRecords.push(saved)
    }

    // LATER: PROCESS INSIGHTS TO GIVE NODES THEN EDGES AND SAVE
    return {
        chunks, 
        insights: insightRecords,
    }
}