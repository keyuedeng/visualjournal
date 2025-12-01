import { prisma } from "@/lib/prisma";

//cosine similarity between two embedding vectors
function cosineSimilarity(a,b) {
    let dot = 0
    let magA = 0
    let magB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i]*b[i]
        magA += a[i]*a[i]
        magB += b[i]*b[i]
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB)
    if (denom === 0) return 0

    return dot/denom
}

/*
finds closest node by comparing embeddings
input: user, topic embedding as vector
returns: node, similarity
*/
export async function findClosestNode(userId, embedding) {
    const nodes = await prisma.node.findMany({
        where: {userId},
        select: {
            id: true,
            label: true,
            embedding: true,
            category: true, 
            count: true,
        },
    })
    if (nodes.length === 0) {
        // create node
        return {
            node: null, 
            similarity: 0,
        }
    }

    let bestNode = null;
    let bestSimilarity = -Infinity

    //compare similarity with each node
    for (const node of nodes) {
        const sim = cosineSimilarity(embedding, node.embedding)

        if (sim > bestSimilarity) {
            bestSimilarity = sim
            bestNode = node
        }
    }
    return {
        node: bestNode, 
        similarity: bestSimilarity
    }
}