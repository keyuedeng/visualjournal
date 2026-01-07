import prisma from "@/lib/prisma";

/*
creates canonical node using topicalias
input: alias (topic as string, embedding as vector, userId)
*/

export async function createNodeFromTopic(alias) {
    const { userId, topic, embedding } = alias
    const label = topic
    const newNode = await prisma.node.create({
        data: {
            userId, 
            label, 
            categories: [],
            count: 1,
            embedding,
            contexts: [],
        }
    })

    return newNode;
}