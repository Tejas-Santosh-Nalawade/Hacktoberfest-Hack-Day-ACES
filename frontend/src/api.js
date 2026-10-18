async function request(path, options) {
  let res
  try {
    res = await fetch(`/api${path}`, options)
  } catch {
    throw new Error("Can't reach the server. Check your connection and retry.")
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail
    throw new Error(detail || 'Something went wrong')
  }
  return body
}

const json = (data) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

export const getHealth = () => request('/health')

export function extractFile(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/extract', { method: 'POST', body: form })
}

export const getReview = ({ topic, transcript, reference }) =>
  request('/review', json({ topic, transcript, reference: reference || null }))

export const getReport = ({ date, reviews }) => request('/report', json({ date, reviews }))
