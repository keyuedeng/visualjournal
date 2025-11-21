export function scoreTopics(topics, meta) { 
    const totalEntries = meta.totalEntries || 1

    // 1) Normalize raw values to 0–1
    const maxEntryCount = Math.max(...topics.map(t => t.entryCount))
    const maxAbsSentiment = Math.max(...topics.map(t => t.absSentimentSum))
    const maxDistinctMonths = Math.max(...topics.map(t => t.distinctMonths))

    // Avoid division by 0
    const maxEC = maxEntryCount || 1
    const maxSent = maxAbsSentiment || 1
    const maxMonths = maxDistinctMonths || 1

    const scored = topics.map(t => {
        // frequency score - how often it appears across entries
        const frequencyScore = t.entryCount / maxEC

        // emotional intensity - how emotionally charged it is
        const emotionalIntensityScore = t.absSentimentSum / maxSent

        // context variance - appears across positive/negative/neutral moments?
        const buckets = t.sentimentBuckets
        const nonZeroBuckets = Object.values(buckets).filter(v => v > 0).length
        const contextVarianceScore = nonZeroBuckets / 3 // positive, neutral, negative

        // stability score - spreads across multiple months, not just one week
        const stabilityScore = t.distinctMonths / maxMonths

        // semantic influence
        const semanticInfluenceScore = 0 // add embeddings later

        // final identity score - weighted mix
        const identityScore =
        0.15 * frequencyScore +
        0.25 * emotionalIntensityScore +
        0.20 * contextVarianceScore +
        0.25 * stabilityScore +
        0.15 * semanticInfluenceScore

        return {
            topic: t.topic,
            frequencyScore,
            emotionalIntensityScore,
            contextVarianceScore,
            stabilityScore,
            semanticInfluenceScore,
            identityScore,
            excerpts: t.excerpts,
            emotionCounts: t.emotionCounts,
            sentiments: t.sentiments,
        }
    })

    return scored
}
