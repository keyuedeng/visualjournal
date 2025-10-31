"use client"
import Sidebar from "@/components/Sidebar"

export default function PrivateLayout ({children}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}