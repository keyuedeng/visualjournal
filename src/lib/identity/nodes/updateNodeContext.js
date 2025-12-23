import { prisma } from "@/lib/prisma";
import { generateNodeSummary } from "./generateNodeSummary";

export async function updateNodeContext(nodeId, context) {
    if (!nodeId) {
        throw new Error("updateNodeContext: nodeId is required")
    }
    if (!context || !context.text ) {
        throw new Error("updateNodeContext: context.text is required")
    }

    const node = await prisma.node.findUnique({
        where: {id: nodeId },
        select: { 
            contexts: true,
            count: true,
            label: true,
            categories: true
        },
    })

    const currContexts = Array.isArray(node.contexts) ? node.contexts: []

    const updatedContexts = [...currContexts, context]

    if (updatedContexts.length > 10) { //maybe can make limit higher, 50?
        updatedContexts.shift()
    }

    // Generate summary if node will have count >= 2
    let updateData = { contexts: updatedContexts }
    
    if (node.count >= 2) {
        const result = await generateNodeSummary({
            ...node,
            contexts: updatedContexts
        })
        
        if (result) {
            updateData.llmSummary = result.summary
            updateData.bulletPoints = result.bulletPoints
        }
    }

    const updatedNode = await prisma.node.update({
        where: { id: nodeId },
        data: updateData,
    })

    return updatedNode
}