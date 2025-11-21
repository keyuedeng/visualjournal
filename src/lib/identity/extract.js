import { openai } from "@/lib/openai"

export async function extractIdentity(scoredTopics) {
    const prompt = `
    You are an identity analyst. You receive a list of topics extracted from a user's journals.
    Each topic has calculated identity scores:

    - frequencyScore
    - emotionalIntensityScore
    - contextVarianceScore
    - stabilityScore
    - identityScore

    Your task is to infer the user's PERSONAL IDENTITY MODEL.

    ──────────────────────────────────────────
    ## IDENTITY LAYER CLASSIFICATION
    ──────────────────────────────────────────

    ### CORE VALUES (ring 0)
    Emotionally important, stable, motivation-anchoring.

    ### PERSONALITY TRAITS / MOTIVATIONS (ring 1)
    Stable tendencies: reflective, driven, anxious, curious.

    ### LIFE THEMES (ring 2)
    Long-term contexts: work, relationships, health, study, growth.

    ### INTERESTS (ring 3)
    Hobbies, preferences, recurring routines.

    ### EMOTIONAL PATTERNS (ring 4)
    Anxiety, calmness, stress, joy, burnout, frustration.

    ### TRANSIENT TOPICS (ring 5)
    Short-lived, low-identity relevance.

    ──────────────────────────────────────────
    ## GRAPH STRUCTURE RULES (IMPORTANT)
    ──────────────────────────────────────────

    ### Avoid:
    - linear chains (A → B → C → D)
    - loops or cycles
    - purely narrative ordering of nodes
    - multiple disconnected graph components
    - islands that cannot reach the core identity

    ### ✔ Aim for:
    - **one unified identity graph**
    - with meaningful, semantic structure
    - NOT forced, but gently guided

    ### ✔ Structure shape:
    - rings 0-1 → dense, central hub
    - ring 2 → connects inward to core/traits
    - ring 3 → connects inward to themes/traits
    - ring 4 → connects inward to core/traits/themes
    - ring 5 → attach to the closest identity parent

    ### ✔ Edge logic:
    Edges represent:
    - semantic similarity
    - emotional connection
    - psychological meaning
    - identityScore closeness
    - co-occurrence across contexts

    ### ✔ Connectivity rule (soft constraint):
    Every node should have AT LEAST ONE **meaningful inward connection**
    BUT avoid chains.  
    Prefer a **hub + spokes + cross-links** structure.

    ### ✔ Edge preference priority:
    1. connect nodes to their inner-ring parent(s)
    2. connect nodes to semantically similar neighbors
    3. add optional cross-links only when conceptually strong

    ──────────────────────────────────────────
    ## OUTPUT FORMAT
    ──────────────────────────────────────────

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