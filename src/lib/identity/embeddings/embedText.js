// gets the embedding as a vector for a topic
import { openai } from "@/lib/openai";

export async function embedText(text) {
    if (!text || typeof text !== "string") {
        throw new Error("embedText() requires non empty string")
    }
    const cleaned = text.trim().toLowerCase()

    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: cleaned,
    })

    const vector = response.data[0].embedding

    return vector
}