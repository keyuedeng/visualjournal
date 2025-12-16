"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false
})

export default function Map() {
    const [graphData, setGraphData] = useState({ nodes: [], links:[] })

    useEffect(() => {
        //fetch data
        fetch('api/graph-data')
            .then(res => res.json())
            .then(data => setGraphData(data))
    }, [])

    return (
        <ForceGraph2D
            graphData={graphData}
            nodeLabel="label"
            nodeVal={node => node.count > 1 ? 6 : 2}
        />
    )
}