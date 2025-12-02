import { prisma } from "@/lib/prisma";

export async function updateNodeContext(nodeId, context) {
    if (!nodeId) {
        throw new Error("updateNodeContext: nodeId is required")
    }
    if (!context || !context.text ) {
        throw new Error("updateNodeContext: context.text is required")
    }

    const node = await prisma.node.findUnique({
        where: {id: nodeId },
        select: { contexts: true },
    })

    const currContexts = Array.isArray(node.contexts) ? node.contexts: []

    const updatedContexts = [...currContexts, context]

    if (updatedContexts.length > 10) { //maybe can make limit higher, 50?
        updatedContexts.shift()
    }

    const updatedNode = await prisma.node.update({
        where: { id: nodeId },
        data: { contexts: updatedContexts },
    })

    return updatedNode
}