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

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
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
        <div className="h-150 flex justify-center items-center border-1 border-neutral-300 m-6 shadow-sm rounded-xl">
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                nodeLabel="label"
                nodeVal={node => node.count > 2 ? 8 : node.count > 1 ? 4 : 2}
                linkCurvature={0.1}
            />
        </div>
    )
}