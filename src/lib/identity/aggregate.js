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

            if (!excerpts[t]) excerpts[t] = []
            if (excerpts[t].length < 3) {
                excerpts[t].push(entry.body.slice(0,200)) //rough snippet
            }
            
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
    // top 10 strongest objects
    const topTopics = Object.entries(topicCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0,15)
        .map(([topic]) => topic)
    //filter excerpts + emotionStats to include only top topics
    const filteredExcerpts = {}
    const filteredEmotionStats = {}

    for (const t of topTopics) {
        filteredExcerpts[t] = excerpts[t] || []
        filteredEmotionStats[t] = emotionStats[t] || { sentiments: [], emotions: [] }
    }

    // also limit cooccurrence
    const allPairs = []
    for (const a in cooccurrence) {
        for (const b in cooccurrence[a]) {
            allPairs.push({ a,b,weight: cooccurrence[a][b] })
        }
    }
    const topCooccurrence = allPairs
        .sort((a,b) => b.weight - a.weight)
        .slice(0,15)

    return { topTopics, excerpts: filteredExcerpts, emotionStats: filteredEmotionStats, cooccurrence: topCooccurrence }
}