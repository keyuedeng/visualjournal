"use client"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import * as d3 from 'd3-force'

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false
})

export default function Map({ onNodeSelect }) {
    const [graphData, setGraphData] = useState({ nodes: [], links:[] })
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const [ripples, setRipples] = useState([])
    const [, setTick] = useState(0)
    const fgRef = useRef()
    const containerRef = useRef()
    const animationFrameRef = useRef()

    // Animation loop for ripples
    useEffect(() => {
        const animate = () => {
            setTick(t => t + 1)
            animationFrameRef.current = requestAnimationFrame(animate)
        }
        animate()
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    // Clean up old ripples
    useEffect(() => {
        const cleanup = setInterval(() => {
            setRipples(prev => prev.filter(r => Date.now() - r.startTime < 1500))
        }, 100)
        return () => clearInterval(cleanup)
    }, [])

    const handleNodeClick = (node) => {
        if (node.count > 1) {
            // Add ripple effect
            setRipples(prev => [...prev, { nodeId: node.id, startTime: Date.now() }])
            onNodeSelect(node.id)
        }
    }

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
            .then(data => {
                setGraphData(data)
                // Set forces immediately after data loads
                if (fgRef.current) {
                    fgRef.current.d3Force('link')
                        .distance(link => {
                            if (link.weight <= 1) return 15
                            if (link.weight > 2) return 5
                            return 10
                        })
                    fgRef.current.d3Force('charge').strength(-400)
                    fgRef.current.d3ReheatSimulation()
                }
            })
    }, [])

    // Backup: Also set forces when fgRef becomes available
    useEffect(() => {
        if (fgRef.current && graphData.nodes.length > 0) {
            fgRef.current.d3Force('link')
                .distance(link => {
                    if (link.weight <= 1) return 15
                    if (link.weight > 2) return 5
                    return 10
                })
            fgRef.current.d3Force('charge').strength(-400)
        }
    }, [fgRef.current, graphData])

    return (
        <div ref={containerRef} className="h-full flex justify-center items-center">
            {graphData.nodes.length === 0 ? (
                <div className="text-center text-neutral-400 max-w-md px-8">
                    <h2 className="text-2xl font-medium mb-3 text-neutral-600">Nothing here yet</h2>
                    <p className="text-base leading-relaxed">
                        Keep writing to see the patterns in your thoughts come alive. 
                        Your themes will start showing up here once they appear more than once.
                    </p>
                </div>
            ) : (
                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    width={dimensions.width}
                    height={dimensions.height}
                    nodeLabel="label"
                    cooldownTicks={100}
                    onEngineStop={() => fgRef.current && fgRef.current.zoomToFit(400, 100)}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        // Skip if node position is not yet initialized
                        if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) return
                        
                        // Color based on node count - less desaturated, fewer colors
                        const getNodeColor = (count) => {
                            if (count >= 5) return '#8B9DC3' // Medium periwinkle
                            if (count >= 3) return '#9FB8AD' // Medium sage
                            if (count >= 2) return '#B5A899' // Medium taupe
                            return '#A8A8A8' // Light gray for single occurrence
                        }
                        
                        // Node size based on count
                        const size = node.count >= 5 ? 9 : node.count >= 3 ? 7 : node.count >= 2 ? 5 : 4
                        
                        // Draw ripples for this node
                        ripples.forEach(ripple => {
                            if (ripple.nodeId === node.id) {
                                const elapsed = Date.now() - ripple.startTime
                                const progress = elapsed / 1500
                                if (progress < 1) {
                                    const maxRadius = 35
                                    const radius = size + (maxRadius * progress)
                                    const opacity = 1 - progress
                                    
                                    ctx.beginPath()
                                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
                                    ctx.strokeStyle = `${getNodeColor(node.count)}${Math.floor(opacity * 128).toString(16).padStart(2, '0')}`
                                    ctx.lineWidth = 2.5
                                    ctx.stroke()
                                    
                                    // Second ripple for depth
                                    if (progress > 0.15) {
                                        const radius2 = size + (maxRadius * (progress - 0.15) * 1.2)
                                        const opacity2 = 1 - (progress - 0.15) * 1.2
                                        ctx.beginPath()
                                        ctx.arc(node.x, node.y, radius2, 0, 2 * Math.PI)
                                        ctx.strokeStyle = `${getNodeColor(node.count)}${Math.floor(opacity2 * 100).toString(16).padStart(2, '0')}`
                                        ctx.lineWidth = 1.5
                                        ctx.stroke()
                                    }
                                }
                            }
                        })
                        
                        // Draw subtle glow for larger nodes
                        if (node.count >= 3) {
                            ctx.beginPath()
                            ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI)
                            const gradient = ctx.createRadialGradient(node.x, node.y, size, node.x, node.y, size + 3)
                            gradient.addColorStop(0, getNodeColor(node.count) + '40')
                            gradient.addColorStop(1, getNodeColor(node.count) + '00')
                            ctx.fillStyle = gradient
                            ctx.fill()
                        }
                        
                        // Draw the main node circle
                        ctx.beginPath()
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
                        ctx.fillStyle = getNodeColor(node.count)
                        ctx.fill()
                        
                        // Draw label only for count > 1
                        if (node.count > 1) {
                            const label = node.label
                            const fontSize = 12/globalScale
                            ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillStyle = '#52525B' // Neutral gray text
                            ctx.fillText(label, node.x, node.y + size + 8)
                        }
                    }}
                    linkColor={() => '#E5E7EB'} // Soft gray links
                    linkWidth={link => Math.min(link.weight * 0.5, 3)}
                    backgroundColor="#FAFAF9" // Warm off-white background
                    nodeVal={node => node.count > 2 ? 8 : node.count > 1 ? 4 : 2}
                    onNodeClick={handleNodeClick}
                />
            )}
        </div>
    )
}