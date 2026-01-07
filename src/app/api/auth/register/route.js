import bcrypt from 'bcryptjs' // to hash passwords before storing them
import prisma from '@/lib/prisma' // to create user in database
import { NextResponse } from 'next/server'

export async function POST(request) {
    const body = await request.json()
    const { email, name, password } = body
    if (!email || !name || !password) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        )
    }
    
    //check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            email: email
        }
    })

    if (existingUser) {
        return NextResponse.json(
            { error: 'Email already registered' },
            { status: 409 }
        )
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email, 
            name, 
            password: hashedPassword
        }
    })

    // return success response
    return NextResponse.json(
        {
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        },
        { status: 201 }
    )
}