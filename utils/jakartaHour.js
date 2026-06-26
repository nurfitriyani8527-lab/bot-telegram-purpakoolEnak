function getJakartaHour() {
    return Number(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Jakarta",
            hour: "numeric",
            hour12: false
        })
    );
}

exports.module = getJakartaHour