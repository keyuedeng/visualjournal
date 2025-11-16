import { openai } from "@/lib/openai"

export async function extractIdentity({
    topTopics, 
    excerpts: filteredExcerpts, 
    emotionStats: filteredEmotionStats, 
    cooccurrence: topCooccurrence
}, candidates) {
    const prompt = `
    You are analysing a user's journal history. 

    DO NOT return code fences.
    DO NOT use \`\`\`json.
    Return ONLY raw JSON with no extra text.

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
        model: "gpt-4o",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify({ topTopics, filteredExcerpts, filteredEmotionStats, topCooccurrence, candidates }
    )}
        ],
        temperature: 0.2
    })

    return JSON.parse(response.choices[0].message.content)
}
