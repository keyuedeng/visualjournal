"use client"
import { useState, useEffect, useRef } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { ArrowUpRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function JournalPage() {
    const today = new Date()
    const options = {
        weekday: "long",
        year: "numeric",
        month:"long",
        day: "numeric"
    }
    const formatted = today.toLocaleDateString("en-US", options)
    const [entries, setEntries] = useState([])

    //fetch entries when page loads
    useEffect(() => {
        async function loadEntries() {
            const res = await fetch("/api/entries") // could specify GET but automatically uses GET
            const data = await res.json() //parse jason data into js array
            setEntries(data) //changes entries state to all the entries
        }

        loadEntries() //runs the above function 

    }, [])
    //handle new entry submission
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    async function handleSubmit(e) {
        e.preventDefault() //stops page refresh
        try {
            const postRes = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body }),
            })

            if (!postRes.ok) {
                console.error('Failed to save entry', await postRes.text())
            }

            //clear input
            setTitle("")
            setBody("")

            
            // get saved entry details
            const postData = await postRes.json()
            const savedEntry = postData.entry

            // call analyser
            const analyseRes = await fetch("/api/analyse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entryId: savedEntry.id,
                    text: savedEntry.body,
                }),
            })

            if (!analyseRes.ok) {
                console.error('Failed to analyse entry')
            }


        } catch (err) {
            console.error('Error saving entry', err)
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
        <div className="m-3">
            <h1 className="mb-4 font-medium text-neutral-700">{greeting}</h1>
            <div className="border border-[#D9D9D9] rounded-xl p-4 mb-8 shadow-sm">
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
                        className="w-full text-3xl focus:outline-none pb-3"
                    />
                    <TextareaAutosize
                        minRows={2}
                        maxRows={15}
                        placeholder="What's been on your mind?"
                        ref={bodyInputRef}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && e.target.value === "") {
                                e.preventDefault()
                                titleInputRef.current?.focus()
                            }
                        }}
                        className="w-full focus:outline-none resize-none overflow-y-auto leading-relaxed text-neutral-700"
                        style = {{ lineHeight: "1.6" }}
                    />
                    <button 
                        type="submit" 
                        disabled={!body.trim()}
                        className={`${
                            !body.trim()
                            ? "bg-neutral-50 text-neutral-300"
                            : "bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-neutral-600"
                        } self-end text-sm p-1 px-3 rounded-xl border border-neutral-300`}>
                        Save
                    </button>
                </form>
            </div>
            {entries.length === 0 ? (
                <p>No entries yet.</p>
            ) : (
                <ul>
                    {entries.map((entry) => (
                        <li key={entry.id}>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-full flex justify-between items-center border-t border-neutral-200 px-4 py-2 hover:bg-neutral-100 transition">
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
                                    <DialogHeader className="p-4">
                                        <DialogTitle>{entry.title}</DialogTitle>
                                        <DialogDescription>
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </DialogDescription>
                                        <div className = "whitespace-pre-wrap">
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
    )
}