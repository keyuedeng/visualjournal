import { prisma } from '@/lib/prisma'
import { openai } from "@/lib/openai"

export async function POST(request) {
    try {
        const { entryId, text } = await request.json()

        if (!text || text.trim().length === 0) {
            return Response.json(
                { error: "text is required for analysis" },
                { status: 400 }
            )
        }

        const result = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "user",
                    content: `Analyze the journal entry and return:
                    - "topics": array of main themes
                    - "sentiment": number between -1 and 1
                    
                    Respond ONLY in JSON.
                    
                    Text: "${text}"
                    `,
                },
            ],
        })

        const analysis = JSON.parse(result.choices[0].message.content)

        const saved = await prisma.insight.create({
            data: {
                entryId,
                topics: analysis.topics || [],
                sentiment: analysis.sentiment || 0,
            },
        })

        return Response.json({
            message: "Analysis succesful",
            insight: saved,
        })
    } catch (error) {
        console.error("Analysis failed: ", error)
        return Response.json({ error: "Failed to analyse text" }, { status: 500 })
    }
}

