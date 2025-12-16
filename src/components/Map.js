"use client"
import { useState, useEffect } from "react"
import ForceGraph2D from "react-force-graph-2d"

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
            linkDirectionalParticles={2}
        />
    )
}