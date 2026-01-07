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

    if (!nodeId) return (
        <div className="p-6 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm flex items-center justify-center">
            <div className="text-center text-gray-400 max-w-xs">
                <p className="text-base leading-relaxed">
                    Click on a theme to explore what you've written about it 💭
                </p>
            </div>
        </div>
    )
    if (loading) return <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm">Loading...</div>
    if (!data) return <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm">No data available</div>

    return (
        <div className="p-4 border border-neutral-300 rounded-md h-full overflow-y-auto shadow-sm"> 
            <h2 className="text-xl font-semibold mb-1">{data.summary.label}</h2>
            <p className="text-sm text-neutral-500 mb-6">
                Appears in {data.summary.count} {data.summary.count === 1 ? 'entry' : 'entries'}
            </p>
            
            {/* What you wrote (bullet point summaries) */}
            {data.bulletPoints && data.bulletPoints.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Moments this appears</h3>
                    <ul className="space-y-1.5">
                        {data.bulletPoints.map((point, index) => (
                            <li key={index} className="text-sm text-neutral-600 flex">
                                <span className="mr-2">–</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* What's being noticed (interpretation) */}
            {data.llmSummary && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">What's being noticed</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">{data.llmSummary}</p>
                </div>
            )}
            
            {/* How this connects (graph context) */}
            {data.connections && (data.connections.outgoing.length > 0 || data.connections.incoming.length > 0) && (() => {
                // Combine all connections with weights
                const allConnections = [
                    ...data.connections.outgoing,
                    ...data.connections.incoming
                ].sort((a, b) => b.weight - a.weight)
                
                const strongConnections = allConnections.filter(c => c.weight > 2)
                const gentleConnections = allConnections.filter(c => c.weight <= 2)
                
                return (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-neutral-700 mb-2">Connected themes</h3>
                        <div className="space-y-2">
                            {strongConnections.length > 0 && (
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Strongly linked:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {strongConnections.slice(0, 5).map((conn, index) => (
                                            <span key={index} className="text-xs px-2 py-1 bg-neutral-100 rounded-md text-neutral-700">
                                                {conn.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {gentleConnections.length > 0 && (
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Gently linked:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {gentleConnections.slice(0, 5).map((conn, index) => (
                                            <span key={index} className="text-xs px-2 py-1 bg-neutral-50 rounded-md text-neutral-600">
                                                {conn.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })()}
            
            {/* Full excerpts at the bottom */}
            {data.excerpts && data.excerpts.length > 0 && (
                <div className="pt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Full excerpts</h3>
                    <div className="space-y-2">
                        {Array.from(new Set(data.excerpts.map(e => e.excerpt || e.text)))
                            .map((excerpt, index) => (
                                <div key={index} className="text-xs text-neutral-500 italic pl-3 border-l-2 border-neutral-200">
                                    {excerpt}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}