import { NextResponse } from "next/server"
import { aggregateInsights } from "@/lib/identity/aggregate"
import { scoreTopics } from "@/lib/identity/score"
import { extractIdentity } from "@/lib/identity/extract"
import { normaliseIdentityOutput } from "@/lib/identity/normalise"
import { saveIdentityGraph } from "@/lib/identity/save"

export async function GET() {
    const userId = "demo-user"
    const agg = await aggregateInsights("demo-user")
    const scored = scoreTopics(agg.topics, agg.meta)
    const identity = await extractIdentity(scored)
    
    const { nodes, edges} = normaliseIdentityOutput(identity.nodes, identity.edges)

    await saveIdentityGraph(userId, nodes, edges)

    return NextResponse.json({ status: "ok", nodes: nodes.length })
}