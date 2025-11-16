import { NextResponse } from "next/server"
import { aggregateInsights } from "@/lib/identity/aggregate"
import { generateCandidates } from "@/lib/identity/candidates"
import { extractIdentity } from "@/lib/identity/extract"
import { saveIdentityGraph } from "@/lib/identity/save"

export async function GET() {
    const userId = "demo-user"
    const agg = await aggregateInsights("demo-user")
    const candidates = generateCandidates(agg)
    const result = await extractIdentity(agg, candidates)

    await saveIdentityGraph(userId, result.nodes, result.edges)

    return NextResponse.json({ status: "ok", nodes: result.nodes.length })
}