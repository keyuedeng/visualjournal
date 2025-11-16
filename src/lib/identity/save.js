import { prisma } from "@/lib/prisma"

export async function saveIdentityGraph(userId, nodes, edges) {
    //wipe old graph
    await prisma.identityEdge.deleteMany({where: { userId }})
    await prisma.identityNode.deleteMany({where: { userId }})

    //insert nodes
    for (const n of nodes) {
        await prisma.identityNode.create({
            data: {
                id: n.id,
                userId, 
                label: n.label,
                category: n.category,
                strength: n.strength,
                ring: null, //COMPUTE THIS LATER
            }
        })
    }

    const validIds = new Set(nodes.map(n => n.id))

    const filterEdges = edges.filter (e =>
        validIds.has(e.source) && validIds.has(e.target)
    )

    //insert edges
    for (const e of filterEdges) {
        await prisma.identityEdge.create({
            data: {
                id: `${e.source}__${e.target}`,
                userId,
                sourceId: e.source,
                targetId: e.target,
                weight: e.weight
            }
        })
    }
}