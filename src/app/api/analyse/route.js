import { processEntry } from "@/lib/identity/pipeline/processEntry";

export async function POST(request) {
    try {
        const { entryId, text } = await request.json();
        
        if (!text || text.trim().length === 0) {
            return Response.json(
            { error: "text is required for analysis" },
            { status: 400 }
            )
        }
        const result = await processEntry(entryId, text);

        return Response.json({
            message: "Analysis successful",
            chunks: result.chunks,
            insights: result.insights,
        })
    } catch (error) {
        console.error("Analysis failed: ", error);
        return Response.json({ error: "failed to analyse text" }, { status: 500 })
    }
}