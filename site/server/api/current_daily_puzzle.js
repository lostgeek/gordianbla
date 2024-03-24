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

  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)

  // Check for query param 'n'
  let days
  if (query.n) {
    days = Number.parseInt(query.n)
    if (Number.isNaN(days))
      return { error: 'Query parameter n must be an integer.' }
  } else {
    days = Math.floor((now - start) / 1000 / 60 / 60 / 24)
  }

  return { startDate: start, daily: days }
})
