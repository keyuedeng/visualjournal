"use client"
import { useState, useEffect } from "react"

export default function JournalPage() {
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
        <div>
            <h1> My Journal</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="write down your thoughts..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <button type="submit">Save Entry</button>
            </form>

            {entries.length === 0 ? (
                <p>No entries yet.</p>
            ) : (
                <ul>
                    {entries.map((entry) => (
                        <li key={entry.id}>
                            <h2>{entry.title}</h2>
                            <p>{entry.body}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}