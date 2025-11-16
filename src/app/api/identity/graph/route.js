import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function GET() {
    const userId = "demo-user" //CHANGE LATER FOR AUTH

    const nodes = await prisma.identityNode.findMany({
        where: { userId }
    })

    const edges = await prisma.identityEdge.findMany({
        where: { userId }
    })

    return NextResponse.json({ nodes, edges })
}