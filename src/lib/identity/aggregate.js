import { prisma } from "@/lib/prisma"

export async function aggregateInsights(userId) {
    const entries = await prisma.entry.findMany({
        where: { userId },
        include: { insight: true }, 
        orderBy: { createdAt: "asc" },
    })

    const topicStats = {}
    let firstDate = null
    let lastDate = null
    
    for (const entry of entries) {
        const insight = entry.insight
        if (!insight) continue

        const topics = insight.topics || []
        const sentiment = insight.sentiment ?? 0
        const emotions = insight.emotions || []

        const createdAt = entry.createdAt
        const dayKey = createdAt.toISOString().slice(0, 10)  // YYYY-MM-DD
        const monthKey = createdAt.toISOString().slice(0, 7) // YYYY-MM

        if (!firstDate) firstDate = createdAt
        lastDate = createdAt

        //classify sentiment context
        let sentimentBucket = "neutral"
        if (sentiment > 0.2) sentimentBucket = "positive"
        else if (sentiment < -0.2) sentimentBucket = "negative"

        for (const t of topics) {
            if (!topicStats[t]) {
                topicStats[t] = {
                    topic: t,
                    entryCount: 0,
                    entryIds: new Set(),
                    sentiments: [],
                    absSentimentSum: 0,
                    sentimentBuckets: { positive: 0, neutral: 0, negative: 0 },
                    emotionCounts: {},          // emotion -> count
                    dayKeys: new Set(),         // distinct days
                    monthKeys: new Set(),       // distinct months
                    excerpts: [],               // up to 2 short snippets
                }
            }

            const stats = topicStats[t]

            stats.entryCount += 1
            stats.entryIds.add(entry.id)

            stats.sentiments.push(sentiment)
            stats.absSentimentSum += Math.abs(sentiment)
            stats.sentimentBuckets[sentimentBucket] += 1

            for (const emo of emotions) {
                stats.emotionCounts[emo] = (stats.emotionCounts[emo] || 0) + 1
            }

            stats.dayKeys.add(dayKey)
            stats.monthKeys.add(monthKey)

            if (stats.excerpts.length < 2) {
                stats.excerpts.push(entry.body.slice(0, 200))
            }
        }
    }
    // convert sets to arrays so json safe
    const topics = Object.values(topicStats).map((s) => ({
        topic: s.topic,
        entryCount: s.entryCount,
        entryIds: Array.from(s.entryIds),
        sentiments: s.sentiments,
        absSentimentSum: s.absSentimentSum,
        sentimentBuckets: s.sentimentBuckets,
        emotionCounts: s.emotionCounts,
        distinctDays: s.dayKeys.size,
        distinctMonths: s.monthKeys.size,
        excerpts: s.excerpts,
    }))

    return {
        topics,
        meta: {
        totalEntries: entries.length,
        firstDate,
        lastDate,
        },
    }
}