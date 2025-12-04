import { openai } from "@/lib/openai";

export async function extractInsight(text) {
    const prompt = 
`
You are an identity-oriented topic extractor.

Your goal is to analyse a SINGLE semantic chunk of a journal entry and extract:
- "topics": 1-3 concrete, identity-relevant theme grounded in the chunk
- "sentiment": a number between -1 and 1 representing the overall emotional tone

You may extract themes based on BOTH:
- what is explicitly written
- what is implied through tone, behaviour, or emotional expression

TOPIC RULES
Extract topics that reflect meaningful aspects of the writer's:
- inner world (emotions, thinking patterns, values)
- behaviours or habits
- interests or personal projects
- stressors or concerns
- identity-related reflections or tendencies
Topics should be:
- short (1-3 words)
- specific enough to be meaningful and grounded in what the chunk actually expresses
- identity-relevant, not trivial surface details
- concrete, not fluffy
- phrased naturally
Avoid:
- long descriptive phrases
- vague or generic abstractions
- duplicate ideas
- trivial nouns that don’t relate to identity
The goal is to capture the key themes that matter to who the writer is.

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