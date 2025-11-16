export function assignRing(category) {
    switch (category) {
        case "core_value":
        case "trait":
            return 0
        
        case "theme":
            return 1
        
        case "interest":
        case "entity":
            return 2
        
        case "emotion_pattern":
            return 3
        
        default:
            return 3
    }
}