import { openai } from "@/lib/openai"
import { raw } from "@prisma/client/runtime/library"

export async function normaliseTopic(rawTopic) {
    const prompt = `
Normalise this topic into a short canonical concept phrase.
Rules:
- Return only the cleaned concept (1-3 words), lowercase.
- Remove filler words: "being", "feeling", "doing", "trying to"
- Convert phrases to their simple concept form
- NO punctuation. NO explanation.

Topic: "${rawTopic}"
Return:`
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt}],
    })

    return response.choices[0].message.content.trim();
}