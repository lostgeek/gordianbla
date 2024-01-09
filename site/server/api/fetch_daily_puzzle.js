import fs from 'node:fs';
import zlib from 'node:zlib';

export default defineEventHandler((event) => {
    const start = new Date("2022-03-05");
    const now = new Date();

    var midnight = new Date();
    midnight.setHours(23, 59, 59, 999);

    const maxAge = Math.floor((midnight-now)/1000);

    // Check for query param 'n'
    const query = getQuery(event);
    var days;
    if (query.n) {
        days = parseInt(query.n);
        if (isNaN(days)) {
            return {error: "Query parameter n must be an integer."};
        }
    } else {
        days = Math.floor((now-start) / 1000/60/60/24);
    }

    const puzzle_id = days.toString().padStart(5, "0");
    const filepath = `./assets/daily_puzzles/${puzzle_id}.svg.gz`;
    const filebuffer = fs.readFileSync(filepath);
    var uncompressed = zlib.unzipSync(filebuffer);
    uncompressed = Buffer.concat([Buffer.from(`<!--daily: ${puzzle_id}-->\n`), uncompressed]);

    setResponseHeaders(event, {
        "Content-Type": "image/svg+xml",
        "Content-Encoding": "gzip",
        "Cache-Control": `public, max-age=${maxAge}`,
    });
    return zlib.gzipSync(uncompressed);
  })