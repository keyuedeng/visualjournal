import { NextResponse } from "next/server";
import { generateCandidates } from "@/lib/identity/candidates";
import { aggregateInsights } from "@/lib/identity/aggregate";

export async function GET() {
    const agg = await aggregateInsights("demo-user")
    const candidates = generateCandidates(agg)
    return NextResponse.json( { agg, candidates })
}