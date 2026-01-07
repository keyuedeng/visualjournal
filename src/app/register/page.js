'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage(){
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name, password })
            })
            
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            router.push('/login')

        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return(
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-6">
                <h1 className="text-2xl font-bold mb-6">Register</h1>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange = {(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="name" className="block mb-2">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange = {(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="Password" className="block mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange = {(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>

                    <p className="mt-4 text-center">
                        Already have an account?{' '}
                        <a href="/login" className="text-blue-500 hover:underline">
                            Login here
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}