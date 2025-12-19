"use client"
import { useState, useEffect } from "react"

export default function NodePanel({ nodeId }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!nodeId) {
            setData(null)
            return
        }

        setLoading(true)
        fetch(`/api/node-insight/${nodeId}`)
            .then(res => res.json())
            .then(data => {
                console.log('API response:', data)
                if (data.error) {
                    console.error('API error:', data.error)
                    setData(null)
                } else {
                    setData(data)
                }
                setLoading(false)
            })
            .catch(error => {
                console.error('Fetch error:', error)
                setData(null)
                setLoading(false)
            })
    },[nodeId])

    if (!nodeId) return <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm">Click a node to see details</div>
    if (loading) return <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm">Loading...</div>
    if (!data) return <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm">No data available</div>

    return (
        <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm"> 
            <h2 className="text-xl font-semibold mb-1">{data.summary.label}</h2>
            <p className="text-sm text-neutral-500 mb-4">
                Appears in {data.summary.count} {data.summary.count === 1 ? 'entry' : 'entries'}
            </p>
            <p className="text-sm leading-relaxed mb-6">{data.llmSummary}</p>
            
            {data.excerpts && data.excerpts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-700 mb-3">Excerpts</h3>
                    <div className="space-y-3">
                        {Array.from(new Set(data.excerpts.map(e => e.excerpt || e.text)))
                            .map((excerpt, index) => (
                                <div key={index} className="text-sm text-neutral-600 italic pl-3 border-l-2 border-neutral-300">
                                    "{excerpt}"
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}