"use client"
import Link from "next/link"
import { NotebookPen, Orbit } from "lucide-react"
import { useUser, useClerk } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'

export default function Sidebar() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const [showPopup, setShowPopup] = useState(false)
    const popupRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false)
            }
        }
        if (showPopup) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown',handleClickOutside)
        }
    },[showPopup])

    return (
        <aside className="w-55 bg-[#F5F5F5] border-r border-[#DBDBDB]">
            <div className="p-4">
                <div className="relative" ref={popupRef}>
                    <button 
                        onClick={() => setShowPopup(!showPopup)}
                        className="w-full text-left px-3 py-3 hover:bg-[#E9E9E9] rounded-md transition-colors font-semibold text-lg cursor-pointer"
                    >
                        {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
                    </button>

                    {showPopup && (
                        <div className="absolute top-full mt-2 right-0 bg-white border rounded-md shadow-lg p-2 z-10 pointer-events-none">
                            <button
                                onClick={() => signOut()}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md pointer-events-auto"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                </div>
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