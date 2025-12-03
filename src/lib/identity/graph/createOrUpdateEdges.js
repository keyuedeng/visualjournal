import { prisma } from "@/lib/prisma";

/*
input: list of nodeIds from the same chunk
output: creates or updates weighted edges between them

- all edges are undirected
- edge weight increments when nodes co-occur in a chunk 
*/

export async function createOrUpdateEdges(userId, nodeIds) {
    if (!nodeIds || nodeIds.length < 2) return

    //dedupe 
    const unique = [...new Set(nodeIds)]

    if (unique.length < 2 ) return //cant have edge for only 1 node
    
    //generate sorted pairs
    const pairs = []
    for (let i = 0; i < unique.length; i++) {
        for (let j=i+1; j<unique.length; j++) {
            const a = unique[i]
            const b = unique[j]
            const [sourceId, targetId] = a < b ? [a,b] : [b,a]
            pairs.push({sourceId, targetId})
        }
    }

    //look up all exisitng edges
    const existingEdges = await prisma.edge.findMany({
        where: {
            userId, 
            OR: pairs.map((p) => ({
                sourceId: p.sourceId,
                targetId: p.targetId,
            })),
        }
    })

    const existingMap = new Map()
    for (const edge of existingEdges) {
        const key = `${edge.sourceId}_${edge.targetId}`
        existingMap.set(key, edge)
    }

    //prepare updates + creates
    const updates = []
    const creates = []

    for (const pair of pairs) {
        const key = `${pair.sourceId}_${pair.targetId}`
        const existing = existingMap.get(key)

        if (existing) {
            updates.push(
                prisma.edge.update({
                    where: { id: existing.id },
                    data: { weight: existing.weight + 1 }
                })
            )
        } else {
            creates.push(
                prisma.edge.create({
                    data: {
                        userId,
                        sourceId: pair.sourceId, 
                        targetId: pair.targetId,
                        weight: 1,
                    }
                })
            )
        }
    }
    
    await Promise.all([...updates, ...creates])
}