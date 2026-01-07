import prisma from "@/lib/prisma";
import { auth } from '@/lib/auth'

export async function GET() {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const nodes = await prisma.node.findMany({
            where: { 
                userId: session.user.id,
                count: {gt:1}
            }
        })
        const nodeIds = nodes.map(n => n.id)
        const edges = await prisma.edge.findMany({
            where: {
                OR: [
                    { sourceId: { in: nodeIds }}, 
                    { targetId: { in: nodeIds }}
                ]
            }
        })

        const links = edges.map(edge => ({
            source: edge.sourceId, 
            target: edge.targetId,
            weight: edge.weight
        }))

        const additionalNodeIds = edges
            .flatMap(e => [e.sourceId, e.targetId])
            .filter(id => !nodeIds.includes(id))
        
        const additionalNodes = await prisma.node.findMany({
            where: { id: { in: additionalNodeIds}}
        })
        const allNodes = [...nodes,...additionalNodes]


        return Response.json({ nodes: allNodes, links })
    } 
    catch (error) {
        console.error("Failed to fetch graph data:", error)
        return Response.json( {error: "Failed to fetch graph data"}, {status: 500})
    }
}