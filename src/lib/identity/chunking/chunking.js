import { openai } from "@/lib/openai";

// Uses LLM based semantic analysis to segment raw text into topic-consistent chunks for downstream processing

export async function semanticChunk(text) {
    if (!text || text.trim().length === 0) {
        return [];
    } else if (text.length <= 500) {
        return [{ index: 1, text}]
    }

    const prompt = 
    `
You are a semantic segmenter for journal entries. 
Your goal is to divide the entry into the FEWEST possible chunks while keeping each chunk thematically coherent. 
Chunks should represent broad themes or "scenes of thought", not small details.

Rules:
- ONLY split when the subject, activity, or emotional theme genuinely changes.
- If the writer returns to the SAME theme later (e.g., productivity → food → productivity again), 
MERGE those non-contiguous parts into ONE chunk. The theme defines the chunk, not the order of sentences.
- Do NOT split based on paragraphs, new sentences, or small detail changes. 
- Keep chunks as long as possible while remaining semantically coherent.
- Most entries should produce 1-5 chunks total. 
- Preserve the original wording exactly.

Return strictly valid JSON. 
NO backticks. 
NO code fences. 
NO explanations. 
NO text before or after the JSON. 
NO trailing commas.

Return in JSON format:
[
{ "index" : 1, "text": "..." },
{ "index" : 2, "text": "..." }
]

Your task: Identify the major themes of the entry and group all text related to each theme into a single chunk, even if pieces appear in different parts of the entry.
Journal Entry:
"""
${text}
"""
    `
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
    })

    let chunks;
    try {
        chunks = JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error("Chunking JSON parse error: ", err)
        return [{ index: 1, text }] //fallback
    }

    // clean + validate
    return chunks
        .filter(c => c?.text && typeof c.text === "string")
        .map((c,i) => ({
            index: c.index ?? i + 1,
            text: c.text.trim()
        }))
}