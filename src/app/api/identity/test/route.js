import { NextResponse } from "next/server";
import { aggregateInsights } from "@/lib/identity/aggregate";

export async function GET() {
    const data = await aggregateInsights("demo-user")
    return NextResponse.json(data)
}