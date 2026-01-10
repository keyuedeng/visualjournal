import prisma from "@/lib/prisma"
import { embedText } from "../embeddings/embedText"
import { normaliseTopic } from "./normaliseTopic"

export async function getOrCreateTopicAlias(userId, rawTopic) {
    if (!rawTopic) {
        throw new Error("getOrCreateTopicAlias: rawTopic is required")
    }

    // normalise raw topic string
    const topic = await normaliseTopic(rawTopic)

    // check if this normalised topic exists in schema already
    const existing = await prisma.topicAlias.findFirst({
        where: {
            topic: topic
        }
    })
    // if exists, return this alias
    if (existing) {
        return existing
    }
    const embedding = await embedText(topic)
    const alias = await prisma.topicAlias.create({
        data: {
            topic,
            embedding,
            canonicalNodeId: null // ASSIGN LATER DURING CANONICALISATION
        }
    })
    
    return alias
}