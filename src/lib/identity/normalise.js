import slugify from "slugify"

export function normaliseIdentityOutput(nodes, edges) {
    const normalisedNodes = nodes.map( n => {
        const id = slugify(n.id || n.label, {
            lower: true,
            strict: true
        }).replace(/-/g,"_")

        return {
            id,
            label: n.label, 
            category: n.category,
            strength: Math.min(1, Math.max(0, n.strength)),
            ring: Number(n.ring ?? 3),
        }
    })

    const normalisedEdges = edges.map( e => ({
        id: `${e.source}__${e.target}`,
        sourceId: slugify(e.source, { lower: true, strict: true}).replace(/-/g, "_"),
        targetId: slugify(e.target, { lower: true, strict: true }).replace(/-/g, "_"),
        weight: Number(e.weight || 0.3),
    }))

    return { nodes: normalisedNodes, edges: normalisedEdges }
}