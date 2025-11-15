export function generateCandidates(agg) {
    const { topicCounts, emotionStats } = agg

    const coreLikely = []
    const themesLikely = []
    const interestsLikely = []
    const emotionalPatterns = []

    for (const topic in topicCounts) {
        const count = topicCounts[topic]
        const emo = emotionStats[topic] || {sentiments: [] }
        const avgSentiment = 
            emo.sentiments.length ? emo.sentiments.reduce((a,b) => a+b, 0) / emo.sentiments.length
            : 0
        
        // rough rules
        if (count > 10) coreLikely.push(topic)
        else if (count > 5) themesLikely.push(topic)
        else interestsLikely.push(topic)

        if (avgSentiment < -0.2) emotionalPatterns.push(`${topic} → negative`)
        if (avgSentiment > 0.4) emotionalPatterns.push(`${topic} → positive`)
    }

    return {
        coreLikely,
        themesLikely,
        interestsLikely, 
        emotionalPatterns,
    }
}