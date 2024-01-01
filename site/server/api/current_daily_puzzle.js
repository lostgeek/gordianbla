export default defineEventHandler((event) => {
    const start = new Date("2022-03-05");
    const now = new Date();

    var midnight = new Date();
    midnight.setHours(23, 59, 59, 999);

    var maxAge = Math.floor((midnight-now)/1000);

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

    return {startDate: start, daily: days};
  })