import { openai } from "@/lib/openai";

export async function extractInsight(text) {
    const prompt = 
`
You are an identity-oriented topic extractor.

Your goal is to analyse a SINGLE semantic chunk of a journal entry and extract:
- "topics": 1-4 identity-relevant theme present in the chunk
- "sentiment": a number between -1 and 1 representing the overall emotional tone

You may extract themes based on BOTH:
- what is explicitly written
- what is implied through tone, behaviour, or emotional expression

Types of acceptable TOPICS include:
1. Internal themes:
- emotional patterns
- thinking patterns
- motivation
- concerns or values
- identity changes
2. External themes that reflect identity or behaviour:
- hobbies and interests
- routines and habits
- social relationships or interactions
- lifestyle preferences
- meaningful activities the writer repeatedly engages in

Guidlines for TOPICS:
- Topics should be meaningful to the person's identity, behaviour, mood, or patterns.
- Avoid trivial nouns (e.g., “tea”, “strawberries”) unless they clearly relate to mood, identity, or behaviour.
- Group similar ideas together (e.g., “tired”, “low energy” → “fatigue”).
- Do not output more than 4 topics. 

Return ONLY valid JSON. No backticks no prefix/suffix.

Format: 
{
    "topics": [...],
    "sentiment": number
}

Chunk to analyse:
"""
${text}
"""
`
    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object"},
        messages: [{ role: "user", content: prompt }],
    })
    return JSON.parse(result.choices[0].message.content);
}