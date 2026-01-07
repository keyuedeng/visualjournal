'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('') // state variable with initial email value as empty string
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter() //gives access to next.js routing functions to redirect after login

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password, 
                redirect: false //don't auto redirect
            })
            if (result && result.error) {
                setError('Invalid email or password')
                setLoading(false)
                return
            }

            router.push('/journal')
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className = "min-h-screen flex items-center justify-center">
            <div className = "max-w-md w-full p-6">
                <h1 className = "text-2xl font-bold mb-6">Login</h1>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block mb-2">
                            Email
                        </label>
                        <input
                            id = "email"
                            type = "email"
                            value = {email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2">
                            Password
                        </label>
                        <input
                            id = "password"
                            type = "password"
                            value = {password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        type = "submit"
                        disabled = {loading}
                        className = "w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mt-6"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className ="mt-4 text-center">
                        Don't have an account?{' '}
                        <a href="/register" className="text-blue-500 hover:underline">
                            Register here
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}