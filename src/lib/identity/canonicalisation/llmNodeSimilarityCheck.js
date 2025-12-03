import { openai } from "@/lib/openai";

/*
asks llm if a topic and node label represent same concept
input: topic, node label
output: yes,no (string)
*/

export async function llmNodeSimilarityCheck(topic, nodeLabel) {
    const prompt = `
You are a classifier deciding if TWO PHRASES refer to the SAME CONCEPT.

Rules:
- "Same concept" means they represent the same identity theme, value, habit, role, or idea.
- Ignore grammar differences, plurality, tense, and stylistic variation.
- Focus on conceptual equivalence.
- If they are related but NOT the same concept, then answer "no".

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