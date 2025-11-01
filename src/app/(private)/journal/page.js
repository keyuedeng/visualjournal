"use client"
import { useState, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"

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
        } catch (err) {
            console.error('Error saving entry', err)
        }

        //clear input
        setTitle("")
        setBody("")

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

    //render form + list
    return (
        <div className="m-3">
            <h1 className="mb-4 font-medium text-stone-700">Good morning, Karen</h1>
            <div className="border border-[#D9D9D9] rounded-xl p-4 mb-8 shadow-sm">
                <h2 className="pb-3 text-stone-600">Today · {formatted}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="New Entry"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-3xl focus:outline-none pb-3"
                    />
                    <TextareaAutosize
                        minRows={2}
                        maxRows={15}
                        placeholder="What's been on your mind?"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full focus:outline-none resize-none overflow-y-auto leading-relaxed text-gray-700"
                        style = {{ lineHeight: "1.6" }}
                    />
                    <button 
                        type="submit" 
                        className="self-end bg-[#F5F5F5] hover:bg-[#E9E9E9] text-sm text-[#444444] p-1 px-3 rounded-xl border border-[#D9D9D9]">
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
                            <h2 className="p-2 my-2 border border-[#D9D9D9] rounded-xl shadow-sm">{new Date(entry.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                            })}
                            {" - "}
                            {entry.title}</h2>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}