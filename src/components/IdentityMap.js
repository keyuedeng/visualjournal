"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false
})

export default function IdentityMap() {
    const [graph, setGraph] = useState({ nodes: [], links: [] })

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/identity/graph")
            const data = await res.json()

            setGraph({
                nodes: data.nodes.map( n => ({
                    id: n.id, 
                    label: n.label,
                    category: n.category, 
                    strength: n.strength, 
                    ring: n.ring
                })), 
                links: data.links.map( e => ({
                    source: e.source.trim(), 
                    target: e.target.trim(), 
                    weight: e.weight
                }))
            })
        }
        load()
    }, [])

    return (
        <div className = "w-full h-[600px] border rounded-lg">
            <ForceGraph2D
                graphData={graph}
                nodeAutoColorBy="category"
                linkColor={() => "#999"}
                nodeCanvasObject={ (node, ctx) => {
                    const label = node.label
                    const size = 6 + node.strength * 10

                    ctx.font = "12px Sans-Serif"
                    ctx.fillStyle = node.color || "black"

                    ctx.beginPath()
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
                    ctx.fill()
                    
                    ctx.fillText(label,node.x + size + 3, node.y + 4)
                }}
            />
        </div>
    )

}