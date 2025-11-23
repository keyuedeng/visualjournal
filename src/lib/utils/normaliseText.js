// normalises raw text

export function normaliseText(str) {
    if (!str) return ""

    let t = str.trim()
    t = t.toLowerCase()
    t = t.replace(/^[^\w]+|[^\w]+$/g, "")
    t = t.replace(/[—–-]/g, " ")
    t = t.replace(/[!?.,;:]+/g, "")
    t = t.replace(/\s+/g, " ")
    t = t.replace(/[\u200B-\u200D\uFEFF]/g, "")

    return t.trim();
}