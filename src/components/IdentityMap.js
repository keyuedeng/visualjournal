"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export default function IdentityMap() {
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [hoverNode, setHoverNode] = useState(null)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/identity/graph")
      const data = await res.json()

      setGraph({
        nodes: data.nodes.map(n => ({
          id: n.id,
          label: n.label,
          category: n.category,
          strength: n.strength,
          ring: n.ring
        })),
        links: data.links.map(e => ({
          source: e.source.trim(),
          target: e.target.trim(),
          weight: e.weight
        }))
      })
    }
    load()
  }, [])

  // 🎨 Color palette for categories
  const CATEGORY_COLORS = useMemo(() => ({
    core_value: "#4C9AFF",         // Blue
    personality_trait: "#4F86C6",  // Deep blue
    life_theme: "#5CB85C",         // Green
    interest: "#8FCB9B",           // Soft green
    emotional_pattern: "#F28E8E",  // Soft red
    default: "#999"
  }), [])

  return (
    <div className="w-full h-[600px] border rounded-lg">
      <ForceGraph2D
        graphData={graph}

        /** 🧲 Better physics */
        cooldownTicks={60}
        d3VelocityDecay={0.35}
        linkCurvature={0.15}
        linkDirectionalParticles={0}

        /** 🎨 Node styling */
        nodeRelSize={6}
        nodeLabel={node => `${node.label} (${node.category})`}

        nodeCanvasObject={(node, ctx) => {
          const size = 6 + node.strength * 12   // Node size scales with importance
          const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.default

          // Highlight hovered or neighbors
          const isHighlighted =
            hoverNode &&
            (hoverNode.id === node.id ||
             graph.links.some(l =>
               (l.source.id === hoverNode.id && l.target.id === node.id) ||
               (l.target.id === hoverNode.id && l.source.id === node.id)
             ))

          const opacity =
            node.strength > 0.6 ? 1 :
            node.strength > 0.3 ? 0.75 :
            0.45

          // Draw node circle
          ctx.beginPath()
          ctx.globalAlpha = opacity
          ctx.fillStyle = isHighlighted ? "#FFD34E" : color
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
          ctx.fill()
          ctx.globalAlpha = 1

          // Draw text label
          ctx.font = "12px Inter, sans-serif"
          ctx.fillStyle = isHighlighted ? "#000" : color
          ctx.textAlign = "left"
          ctx.textBaseline = "middle"
          ctx.fillText(node.label, node.x + size + 4, node.y)
        }}

        /** 🖱️ Hover interactions */
        onNodeHover={setHoverNode}

        linkColor={link =>
          hoverNode &&
          (link.source.id === hoverNode.id || link.target.id === hoverNode.id)
            ? "#FFD34E"
            : "#CCC"
        }
      />
    </div>
  )
}