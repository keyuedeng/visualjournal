import { openai } from "@/lib/openai"

export async function extractIdentity(scoredTopics) {
    const prompt = `
    You are an identity analyst. You receive a list of topics extracted from a user's journals.
    Each topic contains identity-relevant scores:

    - frequencyScore          → how often it appears
    - emotionalIntensityScore → how emotional it is
    - contextVarianceScore    → appears across different emotional states
    - stabilityScore          → appears across many weeks or months
    - identityScore           → combined relevance

    Your task is to infer the user's PERSONAL IDENTITY MODEL.

    ## CLASSIFICATION RULES

    ### CORE VALUES (ring 0)
    Only include if:
    - emotionally significant
    - stable across time
    - tied to self-beliefs or motivations
    Examples: personal growth, emotional awareness, compassion, ambition.

    ### PERSONALITY TRAITS / MOTIVATIONS (ring 1)
    Examples: reflective, driven, anxious, disciplined, curious.

    ### LIFE THEMES (ring 2)
    Long-term themes: work, relationships, health, study, balance.

    ### INTERESTS (ring 3)
    Hobbies, routines, recurring preferences.

    ### EMOTIONAL PATTERNS (ring 4)
    Patterns of feeling: stress, confidence, burnout, calmness, anxiety.

    ### TRANSIENT TOPICS (ring 5)
    Short-term or low-identity elements.

    ### OUTPUT FORMAT
    Return STRICT JSON:

    {
    "nodes": [
        {
        "id": "string",
        "label": "string",
        "category": "core_value | personality_trait | motivation | life_theme | interest | emotional_pattern | external_entity | transient_topic",
        "strength": 0.0,
        "ring": 0
        }
    ],
    "edges": [
        { "source": "string", "target": "string", "weight": 0.0 }
    ]
    }

    Strength 0-1 = importance based on identityScore (scale proportionally).
    Create semantic/emotional/identity-based edges.
    Ensure all nodes connect to at least one other node.
    `
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
            { role: "system", content: prompt},
            { role: "user", content: JSON.stringify(scoredTopics) }
        ],
    })

    let text = response.choices[0].message.content
    text = text.replace(/```json/g, "").replace(/```/g, "").trim()

    return JSON.parse(text)
}