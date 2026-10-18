export const MIN_WORDS = 15

export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
