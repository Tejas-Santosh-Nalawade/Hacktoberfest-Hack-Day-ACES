// Buddy reads feedback aloud with the browser's built-in speech synthesis.
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text, { onEnd } = {}) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-IN'
  u.rate = 1
  u.pitch = 1.1
  u.onend = onEnd
  u.onerror = onEnd
  window.speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}
