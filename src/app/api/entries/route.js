import { prisma } from '@/lib/prisma' // so we can use it in our code

export async function POST(request) {
    try {
        const data = await request.json() //await used in async function to pause the execution of the function until a promise settles
        
        const title = data.title
        const body = data.body?.trim()

        if (!body) {
            return Response.json(
                { error: "Body cannot be empty" },
                { status: 400 }
            )
        }

        const savedEntry = await prisma.entry.create({
            data: { 
                title, 
                body,
                userId: "demo-user",
            },
        })

        return Response.json({ message: "Entry created successfully", entry: savedEntry }) 
    } catch (error) {
        console.error("Failed to save entry:", error)
        return Response.json({ error: "Failed to save entry" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const entries = await prisma.entry.findMany()
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