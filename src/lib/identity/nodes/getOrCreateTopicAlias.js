import { prisma } from "@/lib/prisma"
import { embedText } from "../embeddings/embedText"
import { normaliseTopic } from "./normaliseTopic"

export async function getOrCreateTopicAlias(userId, rawTopic) {
    // normalise raw topic string
    const topic = normaliseTopic(rawTopic)

    // check if this normalised topic exists in schema already
    prisma.TopicAlias
        // if exists, return this alias

    // if not, then create topic alias
        //get embedding
        // insert alias into DB
        // return new alias
}