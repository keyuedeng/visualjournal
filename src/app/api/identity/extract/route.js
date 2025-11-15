import { NextResponse } from "next/server"
import { aggregateInsights } from "@/lib/identity/aggregate"
import { generateCandidates } from "@/lib/identity/candidates"
import { extractIdentity } from "@/lib/identity/extract"

export async function GET() {
    const agg = await aggregateInsights("demo-user")
    const candidates = generateCandidates(agg)
    const result = await extractIdentity(agg, candidates)

    return NextResponse.json(result)
}