import fs from "node:fs";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    var days;
    if (query.n) {
        days = parseInt(query.n);
        if (isNaN(days)) {
            return { error: "Query parameter n must be an integer." };
        }
    } else {
        return { message: "Daily number 'n' not specified." };
    }

    const puzzle_id = days.toString().padStart(5, "0");

    const dailyFolder = "./assets/daily_puzzles/";

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
