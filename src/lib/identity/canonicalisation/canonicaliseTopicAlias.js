import { getOrCreateTopicAlias } from "../topics/getOrCreateTopicAlias";
import { createNodeFromTopic } from "../nodes/createNodeFromTopic";
import { findClosestNode } from "../nodes/findClosestNode";
import { updateNodeContext } from "../nodes/updateNodeContext";
import { updateNodeEmbedding } from "../nodes/updateNodeEmbedding";
import { prisma } from "@/lib/prisma";
import { llmNodeSimilarityCheck } from "./llmNodeSimilarityCheck";

// similarity thresholds 
const HIGH_THRESHOLD = 0.70
const MID_THRESHOLD = 0.50
const LOW_THRESHOLD = 0.00

/*
canonicalises a single topic:
- creates/gets topic
- finds closest node to topic
- decide whether to map to node OR llm fallback OR create new node 
- update centroid and adds context snippets
- returns the canonical nodeid
*/

export async function canonicaliseTopicAlias({
    userId, 
    rawTopic,
    snippet,
    entryId, 
    sentiment
}) {
    // get or create TopicAlias
    const alias = await getOrCreateTopicAlias(userId, rawTopic)

    // if alias has node, only update context and centroid
    if (alias.canonicalNodeId) {
        await updateNodeContext(alias.canonicalNodeId, {
            text: snippet,
            entryId,
            sentiment,
            topic: alias.topic,
        })

        await updateNodeEmbedding(alias.canonicalNodeId)
        return alias.canonicalNodeId
    }

    //find closest node
    const { node: closestNode, similarity } = await findClosestNode(userId, alias.embedding)

    // no nodes in db, create first node
    if (!closestNode) {
        const newNode = await createNodeFromTopic(alias)

        await prisma.topicAlias.update({
            where: { id: alias.id },
            data: { canonicalNodeId: newNode.id },
        })

        await updateNodeContext(newNode.id, {
            text: snippet,
            entryId,
            sentiment,
            topic: alias.topic,
        })

        return newNode.id
    }

    // high similarity, auto assign node
    if (similarity >= HIGH_THRESHOLD) {
        await prisma.topicAlias.update({
            where: {id: alias.id},
            data: { canonicalNodeId: closestNode.id }
        })
        await prisma.node.update({
            where: { id: closestNode.id },
            data: { count: { increment: 1 } }
        })
        await updateNodeEmbedding(closestNode.id)
        await updateNodeContext(closestNode.id, {
            text: snippet,
            entryId, 
            sentiment,
            topic: alias.topic,
        })

        return closestNode.id
    }

    // mid similarity, use llm to confirm
    if (similarity >= MID_THRESHOLD) {
        const decision = await llmNodeSimilarityCheck(alias.topic, closestNode.label) 
        
        if (decision === "yes") {
            //assign to node
            await prisma.topicAlias.update({
                where: {id: alias.id},
                data: { canonicalNodeId: closestNode.id }
            })
            await prisma.node.update({
                where: { id: closestNode.id },
                data: { count: { increment: 1 } }
            })
            await updateNodeEmbedding(closestNode.id)
            await updateNodeContext(closestNode.id, {
                text: snippet,
                entryId, 
                sentiment,
                topic: alias.topic,
            })

            return closestNode.id
        }
    }

    // low similarity or decision == no
    const newNode = await createNodeFromTopic(alias)

    await prisma.topicAlias.update({
        where: {id: alias.id},
        data: { canonicalNodeId: newNode.id },
    })

    await updateNodeContext(newNode.id, {
        text: snippet, 
        entryId, 
        sentiment,
        topic: alias.topic
    })

    return newNode.id
}

