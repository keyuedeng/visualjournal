import { openai } from "@/lib/openai";

/*
asks llm if a topic and node label represent same concept
input: topic, node label
output: yes,no (string)
*/

export async function llmNodeSimilarityCheck(topic, nodeLabel) {
    const prompt = `
You are deciding if TWO TOPIC PHRASES refer to the SAME specific identity concept.

Merge ONLY if:
- They refer to the same concrete behaviour, emotion, stressor, habit, or identity idea.
- They are direct synonyms or standard variations ("restlessness" vs "inner restlessness").
- One is simply a more specific form of the other ("identity project" → "identity").
- They describe the same emotional state ("overwhelm" vs "emotional overwhelm").

Do NOT merge if:
- They belong to the same broad category but represent different concepts 
  (e.g., "self care" vs "growth", "reflection" vs "mindfulness").
- They express opposite or contrasting states.
- They deal with different domains (e.g., work vs relationships).
- One is emotional and the other behavioural.
- They only share a vague psychological similarity.

Important Rule:
- Broad similarity is NOT enough. 
- Merge ONLY when the two phrases would make the same node on a personal identity map.

Output format:
- Respond ONLY with a JSON object of the form:
    { "answer": "yes" }
    or
    { "answer": "no" }
- No explanations, no extra fields, no extra text

Topic: "${topic}"
Node Label: "${nodeLabel}"

Are these the same concept?`
    
    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
            { role: "user", content: prompt }
        ]
    })

    let output;

    try {
        output = JSON.parse(result.choices[0].message.content)
    } catch (err) {
        console.error("Node similarity LLM returned invalid JSON", err)
        return "no"
    }
    const ans = (output.answer || "").toLowerCase().trim()

    if (ans === "yes") return "yes"
    return "no"
}