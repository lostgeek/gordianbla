import fs from 'node:fs';
import zlib from 'node:zlib';

export default defineEventHandler((event) => {
    // Check for query param 'id'
    var puzzle_id;

    const query = getQuery(event);
    if (query.id && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(query.id)) {
        puzzle_id = query.id;
    } else {
        // ToDo: Pick random practice puzzle
    }

    var filepath = `./assets/puzzles/${puzzle_id}.svg.gz`;
    var filebuffer = fs.readFileSync(filepath);
    var uncompressed = zlib.unzipSync(filebuffer);

    setResponseHeaders(event, {
        "Content-Type": "image/svg+xml",
        "Content-Encoding": "gzip",
    });
    return zlib.gzipSync(uncompressed);
  })