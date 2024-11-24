import fs from 'node:fs'
import zlib from 'node:zlib'

export default defineEventHandler((event) => {
  let packFolders = fs.readdirSync('./assets/practice_puzzles')

  const query = getQuery(event)
  if (query.packs) {
    if (!/[0-9a-z-,]+/.test(query.packs))
      return { message: 'Packs filter malformed.' }

    const packs = query.packs.split(',')
    packFolders = packFolders.filter(f => packs.includes(f))
  }

  let puzzles = []
  packFolders.forEach((f) => {
    if (f === '.DS_Store')
      return
    puzzles = puzzles.concat(
      fs
        .readdirSync(`./assets/practice_puzzles/${f}`)
        .filter(x => x !== 'thumb')
        .map(x => `./assets/practice_puzzles/${f}/${x}`),
    )
  })

  if (puzzles.length === 0)
    return { message: 'No cards found for selected packs filter.' }

  const filepath = puzzles[Math.floor(Math.random() * puzzles.length)]
  const filebuffer = fs.readFileSync(filepath)
  const uncompressed = zlib.unzipSync(filebuffer)

  setResponseHeaders(event, {
    'Content-Type': 'image/svg+xml',
    'Content-Encoding': 'gzip',
  })
  return zlib.gzipSync(uncompressed)
})
