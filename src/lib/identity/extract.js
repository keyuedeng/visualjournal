import { openai } from "@/lib/openai"

 export async function extractIdentity(agg, candidates) {
    const prompt = `
    You are analysing a user's journal history. 

    You get:
    - topic frequencies
    - co-occurrences
    - emotional patterns
    - representative excerpts
    - simple category guesses (candidates)

    Your job: 
    - refine the candidates
    - merge similar topics
    - identify stable identity elements
    - categorise them: "core_value", "trait", "theme", "interest", "entity","emotion_pattern"
    - assign each a strength 0-1
    - build relationships based on co-occurrence + meaning

    Output strictly in this JSON format:

    {
        "nodes": [
            { "id": "string", "label": "string", "category": "string", "strength": 0.0 }
        ],
        "edges": [
            { "source": "string", "target": "string", "weight": 0.0 }
        ]
    }
    `

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify({ agg, candidates })}
        ],
        temperature: 0.2
    })

    return JSON.parse(response.choices[0].message.content)
}
