import fs from 'node:fs'
import zlib from 'node:zlib'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const format = (query.format) ? query.format : 'eternal'

  let start
  if (format === 'eternal')
    start = new Date('2022-03-05')
  else if (['standard', 'neo', 'startup'].includes(format))
    start = new Date('2024-01-13')
  else
    return { message: 'Format not found.' }

  const now = new Date()
  const currentDaily = Math.floor((now - start) / 1000 / 60 / 60 / 24)

  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)

  const maxAge = Math.floor((midnight - now) / 1000)

  // Check for query param 'n'
  let days
  if (query.n) {
    days = Number.parseInt(query.n)
    if (Number.isNaN(days))
      return { error: 'Query parameter n must be an integer.' }

    if (days > currentDaily)
      return { error: 'Chosen puzzle is in the future.' }
  } else {
    days = currentDaily
  }

  const puzzle_id = days.toString().padStart(5, '0')
  let format_folder
  if (format === 'eternal')
    format_folder = 'daily_puzzles'
  else if (['standard', 'neo', 'startup'].includes(format))
    format_folder = `daily_${format}_puzzles`

  const filepath = `./assets/${format_folder}/${puzzle_id}.svg.gz`
  const filebuffer = fs.readFileSync(filepath)
  let uncompressed = zlib.unzipSync(filebuffer)
  uncompressed = Buffer.concat([Buffer.from(`<!--daily: ${puzzle_id}-->\n`), uncompressed])

  setResponseHeaders(event, {
    'Content-Type': 'image/svg+xml',
    'Content-Encoding': 'gzip',
    'Cache-Control': `public, max-age=${maxAge}`,
  })
  return zlib.gzipSync(uncompressed)
})
