import { prisma } from '@/lib/prisma'

export async function POST(request) {
    try {
        const { entryId, text } = await request.json()

        if (!text || text.trim().length === 0) {
            return Response.json(
                { error: "text is required for analysis" },
                { status: 400 }
            )
        }

        const mockAnalysis = {
            topics: ["creativity","reflection","mood"],
            sentiment: 0.3,
            emotions: ["tired", "hopeful"],
        }

        const savedInsight = await prisma.insight.create({
            data: {
                entryId,
                topics: mockAnalysis.topics,
                sentiment: mockAnalysis.sentiment,
                emotions: mockAnalysis.emotions,
            }
        })

        return Response.json({
            message: "Analysis succesful",
            analysis: mockAnalysis,
        })
    } catch (error) {
        console.error("Analysis failed: ", error)
        return Response.json({ error: "Failed to analyse text" }, { status: 500 })
    }
}

