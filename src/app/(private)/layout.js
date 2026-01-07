"use client"
import Sidebar from "@/components/Sidebar"
import AuthProvider from '@/components/SessionProvider'

export default function PrivateLayout ({children}) {
    return (
        <AuthProvider>
            <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AuthProvider>
    )
}