import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

//authoptions object - holds all nextauth configuration
export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                // form fields go here - what fields will the login form need?
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            authorize: async function(credentials) {
                // find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                // if no user found, login fails
                if (!user) {
                    return null
                }
                // check if password match
                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                )
                // if password wrong, login fail
                if (!passwordMatch) {
                    return null
                }
                // success, return user object
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            }
        }),
    ], 
    callbacks: {
        jwt: async function({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.username
            }
            return token
        }, 
        session: async function({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.username = token.username
            }
            return session
        }
    }, 
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
    },

}
