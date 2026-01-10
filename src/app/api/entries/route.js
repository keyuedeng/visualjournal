import prisma from '@/lib/prisma'
import { processEntry } from '@/lib/identity/pipeline/processEntry'
import { auth } from '@clerk/nextjs/server'

export const maxDuration = 60

export async function POST(request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const { title, body } = await request.json()
        
        if (!body || body.trim().length === 0) {
            return Response.json(
                { error: "Body cannot be empty" },
                { status: 400 }
            )
        }

        // Ensure user exists in database
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId }
        })

        const savedEntry = await prisma.entry.create({
            data: { 
                userId, 
                title: title || "", 
                body,
            },
        })

        const nodeIds = await processEntry(userId, savedEntry.id, savedEntry.body)

        return Response.json({
            success: true, 
            entry: savedEntry, 
            nodes: nodeIds
        }) 
    } catch (error) {
        console.error("Failed to process entry:", error)
        console.error("Error stack:", error.stack)
        console.error("Error message:", error.message)
        return Response.json({ 
            error: "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const entries = await prisma.entry.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return Response.json(entries)
    }
    catch (error) {
        console.error("Failed to fetch entries:", error)
        return Response.json({ error: "Failed to fetch entries" }, {status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return Response.json({ error: "Missing entry ID" }, { status: 400 })
        }

        await prisma.entry.delete({
            where: { id: id},
        })

        return Response.json({ message: "Entry deleted successfully" })
    }
    catch (error) {
        console.error("Failed to delete entry:", error)
        return Response.json({ error: "Failed to delete entry" }, { status: 500 })
    }
}