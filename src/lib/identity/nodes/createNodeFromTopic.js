import prisma from "@/lib/prisma";

/*
creates canonical node using topicalias
input: userId (string), alias (topic as string, embedding as vector)
*/

export async function createNodeFromTopic(userId, alias) {
    const { topic, embedding } = alias
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