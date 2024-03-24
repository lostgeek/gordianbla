import fs from 'node:fs'
import { Feed } from 'feed'

export default defineEventHandler((event) => {
  const feed = new Feed({
    title: 'Gordianbla.de Daily Puzzle',
    description: 'Daily Netrunner card puzzle',
    id: 'https://gordianbla.de',
    link: 'https://gordianbla.de',
    language: 'en',
  })

  const start = new Date('2022-03-05')
  const now = new Date()

  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)

  const days = Math.floor((now - start) / 1000 / 60 / 60 / 24)

  const dailyFolder = './assets/daily_puzzles/'

  for (let i = days; i > days - 30; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)

    const thumbFilepath
            = `${dailyFolder}thumb/${i.toString().padStart(5, '0')}.png`
    const stats = fs.statSync(thumbFilepath)
    const length = stats.size

    feed.addItem({
      title: `Daily Puzzle #${i}`,
      id: 'https://gordianbla.de',
      link: 'https://gordianbla.de',
      description:
                'Today\'s daily puzzle. Give it a try over on https://gordianbla.de !',
      date: d,
      enclosure: {
        url: `https://gordianbla.de/api/fetch_daily_thumbnail?n=${i}`,
        type: 'image/png',
        length,
      },
    })
  }

  event.node.res.setHeader('content-type', 'text/xml') // we need to tell nitro to return this as a xml file
  event.node.res.end(feed.rss2()) // send the HTTP response
})
