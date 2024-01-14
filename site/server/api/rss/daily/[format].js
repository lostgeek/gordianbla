import { Feed } from "feed";
import fs from "node:fs";

export default defineEventHandler((event) => {
    const format = event.context.params.format;
    if (!['eternal', 'standard', 'neo', 'startup'].includes(format)) {
        return {message: "Format unknown."};
    }

    var formatLabel;
    if(format === 'eternal') {
        formatLabel = "Eternal";
    } else if(format === 'standard') {
        formatLabel = "Standard";
    } else if(format === 'neo') {
        formatLabel = "Neo (All-NSG)";
    } else if(format === 'startup') {
        formatLabel = "Startup";
    }

    const feed = new Feed({
        title: `Gordianbla.de Daily ${formatLabel} Puzzle`,
        description: "Daily Netrunner card puzzle",
        id: `https://gordianbla.de/daily/${format}`,
        link: `https://gordianbla.de/daily/${format}`,
        language: "en",
    });

    var start;
    if(format === 'eternal') {
        start = new Date("2022-03-05");
    } else {
        start = new Date("2024-01-13");
    }
    const now = new Date();

    var midnight = new Date();
    midnight.setHours(23, 59, 59, 999);

    const days = Math.floor((now - start) / 1000 / 60 / 60 / 24);

    var dailyFolder;
    if(format === 'eternal') {
        dailyFolder = "./assets/daily_puzzles/";
    } else {
        dailyFolder = `./assets/daily_${format}_puzzles/`;
    }

    for (var i = days; i > days - 30; i--) {
        if(i <= 0) {
            break
        }

        var d = new Date(start);
        d.setDate(d.getDate() + i);

        const thumbFilepath =
            dailyFolder + `thumb/${i.toString().padStart(5, "0")}.png`;
        const stats = fs.statSync(thumbFilepath);
        const length = stats.size;

        feed.addItem({
            title: `Daily ${formatLabel} Puzzle #${i}`,
            id: `https://gordianbla.de/daily/${format}`,
            link: `https://gordianbla.de/daily/${format}`,
            description:
                `Today's daily puzzle. Give it a try over on https://gordianbla.de/daily/${format} !`,
            date: d,
            enclosure: {
                url: `https://gordianbla.de/api/fetch_daily_thumbnail?n=${i}&amp;format=${format}`,
                type: "image/png",
                length: length,
            },
        });
    }

    event.node.res.setHeader("content-type", "text/xml"); // we need to tell nitro to return this as a xml file
    event.node.res.end(feed.rss2()); // send the HTTP response
});
