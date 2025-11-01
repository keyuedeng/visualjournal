"use client"
import Link from "next/link"
import { NotebookPen, Orbit } from "lucide-react"

export default function Sidebar() {
    return (
        <aside className="w-55 bg-[#F5F5F5] border-r border-[#DBDBDB]">
            <div className="p-4">
                <h2 className="p-2 font-semibold mb-4 rounded-md hover:bg-[#E9E9E9] transition-colors">Karen Deng</h2>
                <nav className="flex flex-col space-y-2">
                    <div className="flex items-center p-2 rounded-md hover:bg-[#E9E9E9] transition-colors text-neutral-700">
                        <NotebookPen />
                        <Link href="/journal" className="ml-2 text-neutral-700">Journal</Link>
                    </div>
                    <div className="flex items-center p-2 rounded-md hover:bg-[#E9E9E9] transition-colors text-neutral-700">
                        <Orbit />
                        <Link href="/map" className="ml-2 text-neutral-700">My Fragments</Link>
                    </div>
                </nav>
            </div>
            
        </aside>
    )
}