// Today's sessions live in localStorage; fall back to memory if storage is blocked.
const memory = {}

export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const key = () => `recapbuddy:${today()}`

function read() {
  try {
    const raw = localStorage.getItem(key())
    return raw ? JSON.parse(raw) : []
  } catch {
    return memory[key()] || []
  }
}

function write(list) {
  memory[key()] = list
  try {
    localStorage.setItem(key(), JSON.stringify(list))
  } catch {
    /* storage blocked — memory copy still works this session */
  }
  return list
}

export const loadToday = () => read()

export function saveSession(review) {
  const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now())
  const session = { id, topic: review.topic, createdAt: new Date().toISOString(), score: review.score, review }
  write([session, ...read()])
  return session
}

export const deleteSession = (id) => write(read().filter((s) => s.id !== id))

export function clearToday() {
  delete memory[key()]
  try {
    localStorage.removeItem(key())
  } catch {
    /* ignore */
  }
  return []
}
