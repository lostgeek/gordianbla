import fs from "node:fs";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const format = (query.format) ? query.format : 'eternal';

    var start;
    if (format === 'eternal') {
        start = new Date("2022-03-05");
    } else if (['standard', 'neo', 'startup'].includes(format)) {
        start = new Date("2024-01-13");
    } else {
        return {message: "Format not found."};
    }

    const now = new Date();
    const currentDaily = Math.floor((now-start) / 1000/60/60/24);

    var days;
    if (query.n) {
        days = parseInt(query.n);
        if (isNaN(days)) {
            return { error: "Query parameter n must be an integer." };
        }
    } else {
        return { message: "Daily number 'n' not specified." };
    }

    if (days > currentDaily) {
        return {error: "Chosen puzzle is in the future."};
    }

    const puzzle_id = days.toString().padStart(5, "0");

    var format_folder;
    if (format === 'eternal') {
        format_folder = 'daily_puzzles';
    } else if (['standard', 'neo', 'startup'].includes(format)) {
        format_folder = `daily_${format}_puzzles`;
    }
    const dailyFolder = `./assets/${format_folder}/`;

    const thumbFilepath = dailyFolder + `thumb/${puzzle_id}.png`;

    try {
        setResponseHeaders(event, {
            "Content-Type": "image/png",
        });

        const data = fs.readFileSync(thumbFilepath);
        return data;
    } catch (err) {
        return {message: "Could not read thumbnail.", error: err.toString()}
    }
});
