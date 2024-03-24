import fs from 'node:fs'
import zlib from 'node:zlib'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (!(query.pack && query.code && query.id))
    return { message: 'Need parameters \'pack\', \'code\', \'id\'.' }

  if (!/[a-z-]+/.test(query.pack))
    return { message: 'Parameter \'pack\' malformed.' }

  if (!/[0-9]{5}/.test(query.code))
    return { message: 'Parameter \'code\' malformed.' }

  if (!/[0-9]{2}/.test(query.id))
    return { message: 'Parameter \'id\' malformed.' }

  const filebuffer = fs.readFileSync(`./assets/practice_puzzles/${query.pack}/${query.code}-${query.id}.svg.gz`)
  const uncompressed = zlib.unzipSync(filebuffer)

  setResponseHeaders(event, {
    'Content-Type': 'image/svg+xml',
    'Content-Encoding': 'gzip',
  })
  return zlib.gzipSync(uncompressed)
})
