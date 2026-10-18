---
name: recap-voice
description: Build the useSpeech React hook and VoiceRecorder for Recap Buddy using the browser Web Speech API — live interim/final transcript, auto-restart after silence, permission errors, typing fallback. Use when working on mic capture or the transcript.
---

# Recap Voice

**Goal:** press Start, talk for minutes, and get a live, editable transcript; it never silently stops.

**Read first:** PRD §13 "useSpeech hook behaviour", FR-4/5/6/7.

## Files
`frontend/src/hooks/useSpeech.js` · `components/VoiceRecorder.jsx` · `components/TranscriptBox.jsx`

## Steps
1. `const SR = window.SpeechRecognition || window.webkitSpeechRecognition`; `supported = !!SR`.
2. Create one instance in a ref: `lang="en-IN"`, `continuous=true`, `interimResults=true`.
3. `onresult`: loop from `e.resultIndex`; append `isFinal` text to the `finalRef` (with a trailing space); rebuild `interim` from the non-final results. State: `finalText`, `interim`.
4. `shouldListen` ref: `start()` sets it true and calls `rec.start()`; `stop()` sets it false and calls `rec.stop()`. `onend`: if `shouldListen` → `rec.start()` again (in try/catch).
5. `onerror`: `not-allowed`/`service-not-allowed` → `error = "Microphone permission denied — you can type instead."` and stop; ignore `no-speech`/`aborted`.
6. Expose `{supported, listening, finalText, interim, error, start, stop, reset, setFinalText}`.
7. **TranscriptBox:** a controlled textarea whose value is `finalText + interim` while listening; editing writes back via `setFinalText`. It shows a live word count and a Clear button, and the interim text renders in `zinc-400`.
8. **VoiceRecorder:** Start/Stop button with the pulsing dot + bars from `recap-ui-system`. If `!supported`, show a notice: "Voice works in Chrome or Edge — you can type below."

## Done when
- [ ] Talking 2+ minutes with pauses keeps transcribing until Stop
- [ ] Denying the mic shows the message and typing still works
- [ ] Firefox shows the notice and typing works

## Pitfalls
- Calling `start()` twice throws — guard with try/catch.
- Needs HTTPS or localhost.
- Clean up on unmount (`shouldListen=false; rec.abort()`).

## Tools
Claude in Chrome (manual mic test; mic permission prompts need the user).
