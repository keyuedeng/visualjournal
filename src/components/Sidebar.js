"use client"
import Link from "next/link"

export default function Sidebar() {
    return (
        <aside className="w-55 bg-[#F5F5F5] border-r border-[#DBDBDB]">
            <div className="p-4">
                <h2 className="p-2 font-semibold mb-4 rounded-md hover:bg-[#E9E9E9] transition-colors">Karen Deng</h2>
                <nav className="flex flex-col space-y-2">
                    <Link href="/journal" className="p-2 rounded-md text-gray-700 hover:bg-[#E9E9E9] transition-colors">Journal</Link>
                    <Link href="/map" className="p-2 rounded-md text-gray-700 hover:bg-[#E9E9E9] transition-colors">Map</Link>
                </nav>
            </div>
            
        </aside>
    )
}