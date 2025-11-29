import { openai } from "@/lib/openai";

export async function extractInsight(text) {
    const prompt = 
`
You are an identity-oriented topic extractor.

Your goal is to analyse a SINGLE semantic chunk of a journal entry and extract:
- "topics": 1-5 identity-relevant theme present in the chunk
- "sentiment": a number between -1 and 1 representing the overall emotional tone

You may extract themes based on BOTH:
- what is explicitly written
- what is implied through the way the writer expresses themselves

This includes:
- tone of voice
- emotional patterns
- thinking patterns
- motivation levels
- implicit values or concerns

Guidlines for TOPICS:
- Topics should reflect psychological or experiential themes, not surface-level nouns.
- Good examples: “focus difficulty”, “fatigue”, “identity change”, “self-regulation”, 
  “emotional overwhelm”, “relationship closeness”, “avoidance”, “personal growth”.
- Bad examples: “tea”, “gym”, “Instagram”, “strawberries” (unless emotionally meaningful).
- You may infer deeper themes if the writing style clearly implies them.
- Group similar ideas together (e.g., “exhausted”, “low energy” → “fatigue”).
- Do not output more than 5 topics

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