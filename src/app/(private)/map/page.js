"use client"
import Map from "@/components/Map"
import NodePanel from "@/components/NodePanel"
import { useState } from "react"

export default function MapPage() {
    const [selectedNodeId, setSelectedNodeId] = useState(null)

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-grow">
                <Map onNodeSelect={setSelectedNodeId}/>
            </div>
            <div className="w-100 py-4 pr-2">
                <NodePanel nodeId={selectedNodeId} />
            </div>
        </div>
    )
}