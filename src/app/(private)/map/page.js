"use client"
import Map from "@/components/Map"
import NodePanel from "@/components/NodePanel"
export default function MapPage() {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-grow">
                <Map />
            </div>
            <div className="w-80 py-4 pr-2">
                <NodePanel />
            </div>
        </div>
    )
}