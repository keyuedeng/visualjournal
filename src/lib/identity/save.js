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
                ring: n.ring,
            }
        })
    }

    // insert edges
    for (const e of edges) {
        // prevent edges pointing to non-existent nodes
        if (!nodes.find(n => n.id === e.sourceId)) continue
        if (!nodes.find(n => n.id === e.targetId)) continue

        await prisma.identityEdge.create({
            data: {
                id: e.id,
                userId, 
                sourceId: e.sourceId, 
                targetId: e.targetId,
                weight: e.weight,
            }
        })
    }
}