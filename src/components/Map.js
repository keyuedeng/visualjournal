"use client"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import * as d3 from 'd3-force'

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false
})

export default function Map() {
    const [graphData, setGraphData] = useState({ nodes: [], links:[] })
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const fgRef = useRef()
    const containerRef = useRef()

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({ 
                width: containerRef.current.offsetWidth, 
                height: containerRef.current.offsetHeight 
            })
        }
    }, [])

    useEffect(() => {
        //fetch data
        fetch('api/graph-data')
            .then(res => res.json())
            .then(data => setGraphData(data))
    }, [])

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('link').distance(link => {
                if (link.weight <= 1) return 15
                if (link.weight > 2) return 5
                return 10
            })
            fgRef.current.d3Force('charge').strength(-400)
        }
    }, [graphData])

    return (
        <div ref={containerRef} className="h-full flex justify-center items-center">
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                nodeLabel="label"
                nodeCanvasObject={(node, ctx, globalScale) => {
                    // Draw the node circle
                    const size = node.count > 2 ? 8 : node.count > 1 ? 6 : 3
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
                    ctx.fillStyle = node.color || '#999'
                    ctx.fill()
                    
                    // Draw label only for count > 1
                    if (node.count > 1) {
                        const label = node.label
                        const fontSize = 12/globalScale
                        ctx.font = `${fontSize}px Sans-Serif`
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillStyle = '#333'
                        ctx.fillText(label, node.x, node.y + size + 5)
                    }
                }}
                nodeVal={node => node.count > 2 ? 8 : node.count > 1 ? 4 : 2}
            />
        </div>
    )
}