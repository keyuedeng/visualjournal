import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const nodeId = searchParams.get("nodeId")
    const userId = "demo-user" // ADD AUTH LATER

    if(!nodeId) {
        return NextResponse.json({ error: "Missing nodeId" }, { status: 400})
    }

    //check if insight already exsits 
    const existing = await prisma.identityNodeInsight.findFirst({
        where: {nodeId, userId}
    })

    if(existing) {
        return NextResponse.json(existing)
    }

    const node = await prisma.identityNode.findUnique({
        where: {id: nodeId}
    })

    if (!node) {
        return NextResponse.json(
            { error:`Node not found: ${nodeId}` },
            {status:404}
        )
    }

    const edges = await prisma.identityEdge.findMany({
        where: { OR: [{ sourceId: nodeId }, { targetId: nodeId }], userId }
    })

    const neighbourIds = edges.map( e =>
        e.sourceId === nodeId ? e.targetId : e.sourceId
    )

    const neighbours = await prisma.identityNode.findMany({
        where: {id: {in: neighbourIds}}
    })

    const rawTopic = node.id.replace(/_/g, "").toLowerCase()

    const excerptMatch = await prisma.insight.findMany({
        where: { topics: { has: rawTopic}},
        select: { entry: true }
    })

    const excerpts = excerptMatch.map(e => e.entry.body.slice(0,200)).slice(0,5)

    const prompt = `
You are an expert identity analyst with a warm, grounded, emotionally intelligent style. 
Your job is to interpret an IDENTITY NODE — not clinically, not dramatically, not as a diagnosis, 
but as a meaningful part of this person's inner world.

──────────────────────────────────────────
## DATA YOU RECEIVE
──────────────────────────────────────────

Node details:
- Label (the identity concept)
- Category (core value, personality trait, life theme, emotional pattern, interest...)
- Strength (0-1; importance within identity)
- Ring (0 = core, 1 = trait/motivation, 2 = life theme, 3 = interest, 4 = emotional pattern, 5 = transient)

Connected nodes represent meaningful psychological relationships.

Excerpts come directly from the user's journals and reflect lived experiences.

──────────────────────────────────────────
## YOUR TASK
──────────────────────────────────────────

### Provide a DEEP INTERPRETATION of:
- what this identity element represents about the person
- why it appears in their inner world
- the emotional or motivational forces behind it
- how it interacts with connected identity elements
- what this reveals about coping, needs, desires, patterns, or personal narrative
- how this fits into their broader identity structure

This should feel *insightful*, *empathetic*, and *psychologically grounded* — not generic.

DO NOT give therapy or advice.  
DO NOT diagnose.  
Just interpret patterns, meaning, and identity structure.

──────────────────────────────────────────
## REQUIRED OUTPUT FORMAT
Return STRICT JSON:

{
"summary": "One long, deeply reflective paragraph (3-5 sentences).",
"notes": "A shorter paragraph highlighting 1-2 underlying psychological dynamics."
}

──────────────────────────────────────────
## TONE
Write with:
- warmth and emotional intelligence
- grounded, calm clarity
- reflective insights that sound human, not clinical
- gentle interpretation without heavy analysis
- validation without excessive comfort
- emotional depth without drama
- curiosity, not judgment

Perspective:
Always write directly TO the user, using “you” and “your.”
Never refer to them as “the person,” “the user,” or “they.”
It should feel like a gentle reflection *about you*, not an analysis of someone else.

Avoid:
- clinical language (“internal conflict,” “complex emotional landscape,” “deep-seated,” “symptoms”)
- dramatic wording (“struggle,” “fraught,” “destabilizing,” “protective mechanism”)
- psychoanalytic frameworks
- diagnosing or implying pathology
- overly intense descriptions

Aim for:
- warm psychological insight
- describing why this identity element makes sense for the person
- focusing on what the element reveals about values, needs, and emotional tendencies
- smooth, human language that feels thoughtful and personal
──────────────────────────────────────────
## IMPORTANT STYLE GUIDELINES

### 1. SUMMARY
Offer a rich interpretation of:
- the emotional role the node plays
- how it shapes decision-making or self-perception
- what connected nodes suggest about deeper patterns
- how stable or evolving the theme feels

### 2. NOTES
Highlight:
- underlying needs or values
- possible tensions or contradictions
- what the combination of strength + neighbors implies

Do NOT instruct the user or tell them what to do.  
Do NOT be overly vague.  
Do NOT write in bullet points.  

Only deep, contextual identity insight.
    `
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt},
            { role: "user", content: JSON.stringify({
                node: {
                    label: node.label,
                    category: node.category,
                    strength: node.strength,
                    ring: node.ring
                },
                neighbours: neighbours.map( n => ({
                    label: n.label,
                    category: n.category,
                    strength: n.strength,
                    ring: n.ring
                })), 
                excerpts: excerpts
            })}
        ],
        temperature: 0.5
    })

    let json
    try {
        json = JSON.parse(response.choices[0].message.content)
    } catch (e) {
        json = {summary: "Error generating summary", notes: ""}
    }

    //save to DB
    const saved = await prisma.identityNodeInsight.create({
        data: {
            userId,
            nodeId,
            summary: json.summary,
            notes: json.notes,
            excerpts
        }
    })
    return NextResponse.json(saved)
}