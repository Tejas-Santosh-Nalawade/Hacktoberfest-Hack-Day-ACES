import { useCallback, useEffect, useRef, useState } from 'react'

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function useSpeech() {
  const supported = !!SR
  const recRef = useRef(null)
  const shouldListen = useRef(false)
  const finalRef = useRef('')
  const [finalText, setFinal] = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supported) return
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          const sep = finalRef.current && !finalRef.current.endsWith(' ') ? ' ' : ''
          finalRef.current += sep + text.trim() + ' '
        } else {
          live += text
        }
      }
      setFinal(finalRef.current)
      setInterim(live)
    }

    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        shouldListen.current = false
        setError('Microphone permission denied — you can type instead.')
      } else if (e.error === 'audio-capture') {
        shouldListen.current = false
        setError('No microphone found — you can type instead.')
      }
      // no-speech / aborted / network: let onend decide whether to restart
    }

    // Chrome ends the session after silence; keep going until the user presses Stop.
    rec.onend = () => {
      setInterim('')
      if (shouldListen.current) {
        try {
          rec.start()
          return
        } catch {
          shouldListen.current = false
        }
      }
      setListening(false)
    }

    recRef.current = rec
    return () => {
      shouldListen.current = false
      rec.onend = null
      try {
        rec.abort()
      } catch {
        /* already stopped */
      }
    }
  }, [supported])

  const start = useCallback(() => {
    const rec = recRef.current
    if (!rec || shouldListen.current) return
    setError('')
    shouldListen.current = true
    try {
      rec.start()
      setListening(true)
    } catch {
      // already started
      setListening(true)
    }
  }, [])

  const stop = useCallback(() => {
    shouldListen.current = false
    try {
      recRef.current?.stop()
    } catch {
      /* not running */
    }
    setListening(false)
  }, [])

  const setFinalText = useCallback((text) => {
    finalRef.current = text
    setFinal(text)
  }, [])

  const reset = useCallback(() => {
    finalRef.current = ''
    setFinal('')
    setInterim('')
  }, [])

  return { supported, listening, finalText, interim, error, start, stop, reset, setFinalText }
}
