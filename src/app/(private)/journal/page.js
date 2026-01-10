"use client"
import { useState, useEffect, useRef } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpRight } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function JournalPage() {
    const { user } = useUser()
    const today = new Date()
    const options = {
        weekday: "long",
        year: "numeric",
        month:"long",
        day: "numeric"
    }
    const formatted = today.toLocaleDateString("en-US", options)
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [placeholder, setPlaceholder] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const fullPlaceholder = "What's been on your mind?"

    //fetch entries when page loads
    useEffect(() => {
        async function loadEntries() {
            const res = await fetch("/api/entries") // could specify GET but automatically uses GET
            const data = await res.json() //parse jason data into js array
            setEntries(data) //changes entries state to all the entries
            setLoading(false) //done loading
        }

        loadEntries() //runs the above function 

    }, [])

    //typing animation for placeholder
    useEffect(() => {
        let index = 0
        const typingInterval = setInterval(() => {
            if (index <= fullPlaceholder.length) {
                setPlaceholder(fullPlaceholder.slice(0, index))
                index++
            } else {
                clearInterval(typingInterval)
            }
        }, 60) // 50ms per character

        return () => clearInterval(typingInterval)
    }, [])

    //blinking cursor effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)

        return () => clearInterval(cursorInterval)
    }, [])
    //handle new entry submission
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [saveStatus, setSaveStatus] = useState("") // "", "saving", "success", "error"
    
    async function handleSubmit(e) {
        e.preventDefault() //stops page refresh
        
        //clear input immediately for better UX
        const titleToSave = title
        const bodyToSave = body
        setTitle("")
        setBody("")
        setSaveStatus("saving")
        
        try {
            const postRes = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: titleToSave, 
                    body: bodyToSave,
                }),
            })

            if (!postRes.ok) {
                console.error('Failed to save entry', await postRes.text())
                setSaveStatus("error")
                setTimeout(() => setSaveStatus(""), 3000)
                return
            }
            
            setSaveStatus("success")
            setTimeout(() => setSaveStatus(""), 3000)

        } catch (err) {
            console.error('Error saving entry', err)
            setSaveStatus("error")
            setTimeout(() => setSaveStatus(""), 3000)
        }

        //reload entries
        try {
            const res = await fetch("/api/entries")
            if (res.ok) {
                const data = await res.json()
                setEntries(data)
            } else {
                console.error('Failed to load entries', await res.text())
            }
        } catch (err) {
            console.error('Error loading entries', err)
        }
    }

    //handle input
    const bodyInputRef = useRef(null)
    const titleInputRef = useRef(null)

    const hour = today.getHours();
    let greeting;
    if (hour >= 0 && hour <= 11) {
        greeting = "Good morning, "
    } else if (hour > 11 && hour < 17) {
        greeting = "Good afternoon, "
    } else {
        greeting = "Good evening, "
    }

    //render form + list
    return (
        <div className="p-6 pl-8 bg-gradient-to-br from-stone-100/50 via-slate-50/40 to-neutral-100/50 min-h-screen">
            <h1 className="mb-4 font-medium text-neutral-700">{greeting}{user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}</h1>
            <div className="border border-stone-200 rounded-xl p-4 mb-8 shadow-sm bg-white/80">
                <h2 className="pb-3 text-neutral-600">Today · {formatted}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="New Entry"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                bodyInputRef.current?.focus()
                            }
                        }}
                        ref={titleInputRef}
                        className="w-full text-4xl focus:outline-none pb-3 font-[family-name:var(--font-cormorant)] placeholder:font-semibold font-semibold text-neutral-700"
                    />
                    <TextareaAutosize
                        minRows={2}
                        maxRows={15}
                        placeholder={placeholder + (showCursor && !body ? '|' : '')}
                        ref={bodyInputRef}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && e.target.value === "") {
                                e.preventDefault()
                                titleInputRef.current?.focus()
                            }
                        }}
                        className="w-full focus:outline-none resize-none overflow-y-auto leading-relaxed text-neutral-700 text-lg placeholder:italic placeholder:text-xl placeholder:font-medium placeholder:tracking-wide placeholder:font-[family-name:var(--font-cormorant)]"
                        style = {{ lineHeight: "1.6" }}
                    />
                    <button 
                        type="submit" 
                        disabled={!body.trim()}
                        className={`${
                            !body.trim()
                            ? "bg-stone-50 text-stone-300"
                            : "bg-stone-100 hover:bg-stone-200 cursor-pointer text-neutral-600"
                        } self-end text-sm p-1 px-3 rounded-xl border border-stone-300`}>
                        Save
                    </button>
                </form>
                
                {/* Status popup */}
                {saveStatus && (
                    <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg transition-all ${
                        saveStatus === "saving" ? "bg-blue-500 text-white" :
                        saveStatus === "success" ? "bg-green-500 text-white" :
                        "bg-red-500 text-white"
                    }`}>
                        {saveStatus === "saving" && "Entry added! Processing..."}
                        {saveStatus === "success" && "Entry processed successfully!"}
                        {saveStatus === "error" && "Failed to save entry"}
                    </div>
                )}
            </div>
            {loading ? (
                <div>Loading entries...</div>
            ) : (
                <div>
                {entries.length === 0 ? (
                    <p>No entries yet.</p>
                ) : (
                    <ul>
                        {entries.map((entry) => (
                            <li key={entry.id}>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="w-full flex justify-between items-center border-t border-stone-200 px-4 py-2 hover:bg-stone-100/50 transition">
                                            <div className="flex items-center gap-1 text-neutral-700">
                                                <span>
                                                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "2-digit",
                                                    })}
                                                </span>
                                                <span>-</span>
                                                {entry.title === "" ? (
                                                    <span className="text-neutral-500">{entry.body.split(' ').slice(0,7).join(' ')}{"..."}</span>
                                                ) : (
                                                    <span>{entry.title}</span>
                                                )}
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="!max-w-2xl !h-[85vh] overflow-y-auto">
                                        <DialogHeader className="p-6 space-y-4">
                                            <DialogTitle className="text-3xl font-[family-name:var(--font-cormorant)] font-semibold text-neutral-800">{entry.title}</DialogTitle>
                                            <DialogDescription className="text-sm text-neutral-500">
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </DialogDescription>
                                            <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-lg pt-2">
                                                {entry.body}
                                            </div>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </li>
                        ))}
                    </ul>
                )}
            </div> 
            )}
            
        </div>
    )
}