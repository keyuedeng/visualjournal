import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const nodes = await prisma.node.findMany({
            where: { count: {gt:1}}
        })
        const nodeIds = nodes.map(n => n.id)
        const edges = await prisma.edge.findMany({
            where: {
                AND: [
                    { sourceId: { in: nodeIds }}, 
                    { targetId: { in: nodeIds }}
                ]
            }
        })

        const links = edges.map(edge => ({
            source: edge.souceId, 
            target: edge.targetId,
            weight: edge.weight
        }))
        return Response.json({ nodes,links })
    } 
    catch (error) {
        console.error("Failed to fetch graph data:", error)
        return Response.json( {error: "Failed to fetch graph data"}, {status: 500})
    }
}