import { prisma } from "@/lib/prisma"

export async function aggregateInsights(userId) {
    const entries = await prisma.entry.findMany({
        where: { userId },
        include: { insight: true }
    })

    const topicCounts = {}
    const cooccurrence = {}
    const excerpts = {}
    const emotionStats = {}

    for (const entry of entries) {
        const insight = entry.insight
        if (!insight) continue
        
        const topics = insight.topics || []

        //count topics
        for (const t of topics) {
            topicCounts[t] = (topicCounts[t] || 0) + 1

            excerpts[t] ||= []
            excerpts[t].push(entry.body.slice(0,500)) //rough snippet

            emotionStats[t] ||= { sentiments: [], emotions: [] }
            emotionStats[t].sentiments.push(insight.sentiment)
            emotionStats[t].emotions.push(...insight.emotions)
        }

        // co-occurrence
        for (let i=0; i<topics.length; i++) {
            for (let j=i+1; j<topics.length; j++) {
                const a = topics[i], b = topics[j]
                cooccurrence[a] ||= {}
                cooccurrence[b] ||= {}
                cooccurrence[a][b] = (cooccurrence[a][b] || 0) + 1
                cooccurrence[b][a] = (cooccurrence[b][a] || 0) + 1
            }
        }
    }

    return { topicCounts, cooccurrence, emotionStats, excerpts }
}