import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

// classifies a node into soft categories

export async function classifyNodeCategories(nodeId) {
    const node = await prisma.node.findUnique({
        where: { id: nodeId },
        select: {
            label: true, 
            categories: true, 
            contexts: true,
        },
    })

    if (!node) return

    if (node.categories.length > 0) return
    if (!node.contexts || node.contexts.length < 3) return

    const snippets = node.contexts.slice(0,5).map((c,i) => `${i + 1}.${c.text}`).join("\n")

    const prompt=`
You are classifying an identity concept into one or more categories. 

Node label:
"${node.label}"

Context snippets:
${snippets}

Available categories:
- emotional_state
- thought_pattern
- motivation
- habits
- relationships
- interests
- self_concept
- wellbeing

Rules:
- Choose categories that clearly apply.
- Do NOT invent new categories.
- If none apply clearly, return an empty list.
- Be conservative: fewer is better than more.
- Respond ONLY with valid JSON in this format:
{
    "categories":["category1", "category2"]
}
`
    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [ {role: "user", content: prompt }]
    })

    let parsed
    try {
        parsed = JSON.parse(result.choices[0].message.content)
    } catch {
        return
    }

    const categories = Array.isArray(parsed.categories)
        ? parsed.categories.filter(Boolean)
        : []
    
    await prisma.node.update({
        where: { id: nodeId },
        data: { categories },
    })
}

