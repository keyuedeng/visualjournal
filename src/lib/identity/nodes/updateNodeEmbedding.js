import prisma from "@/lib/prisma";

export async function updateNodeEmbedding(nodeId){
    if (!nodeId) {
        throw new Error("updateNodeEmbedding: nodeId is required")
    }

    const topics = await prisma.topicAlias.findMany({
        where: { canonicalNodeId: nodeId,}, 
        select: {embedding: true },
    })

    if (topics.length === 0) {
        return prisma.node.findUnique({where: {id: nodeId}})
    }

    //compute centroid (mean vector)
    const dimension = topics[0].embedding.length
    const sumVec = new Array(dimension).fill(0)
    
    for (const topic of topics) {
        const vec = topic.embedding
        for (let i = 0; i<dimension; i++) {
            sumVec[i] += vec[i]
        }
    }

    const centroid = sumVec.map((v)=> v/topics.length)
    
    // update embedding
    const updatedNode = await prisma.node.update({
        where: { id: nodeId },
        data: { embedding: centroid },
    })

    return updatedNode
}