import { openai } from "@/lib/openai"

export async function normaliseTopic(rawTopic) {
    const prompt = `
Normalise this topic into a short canonical concept (1–3 words), lowercase.

Foundational Rule:
- If the phrase is already a meaningful, specific identity-relevant concept, KEEP it as-is.
- DO NOT collapse it into a broader category unless it is vague, redundant, or unclear.
- Always preserve meaningful behavioral context (e.g., “study difficulty”, “walking reset”, “avoidance behavior”, “nature enjoyment”).

General Rules:
- Return ONLY the cleaned concept, no punctuation or explanation.
- Remove filler words ("feeling", "being", "trying", "needing", "to be", etc.).
- Keep the concept natural, concise, and identity-relevant.
- Preserve nuance when it reflects a concrete emotion, behaviour, habit, or self-concept.
- Only collapse when the phrase is abstract or over-general (e.g., “stress relief”, “balance”, “improvement”).

Canonical Mapping Rules (apply ONLY when the phrase is vague or clearly a synonym set):
- Any phrase beginning with “identity”, “self-identity”, “identity work” → “identity”
- “management”, “control”, “handling” → “management”
- “difficulty”, “struggle”, “challenge” → “difficulty”
- “chaos”, “turmoil”, “overwhelm” → “overwhelm”
- “growth”, “improvement”, “development” → “growth”
- “reset”, “recovery”, “recentering” → “recovery”
- “self care”, “care routine”, “rest routine” → “self-maintenance”
- “balance”, “inner peace”, “equilibrium” → “emotional regulation”
- fatigue/tiredness phrases → “fatigue”
- avoidance ↔ “avoidance behavior”
- pride/accomplishment phrases → “small wins”

If multiple rules match:
1) choose the most specific option,
2) avoid over-broad categories,
3) prioritize behavioural identity concepts over abstract emotion words.

Topic: "${rawTopic}"
Return:`
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt}],
    })

    const normalised = response.choices[0].message.content.trim();
    console.log(`Normalising "${rawTopic}" → "${normalised}"`);

    return normalised
}