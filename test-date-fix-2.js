const { formatDate } = require("./app/lib/dateUtils");

const dateStr = "2024-04-21";
const utcDate = new Date(dateStr); // this is UTC midnight
const localDate = new Date(dateStr + "T00:00:00"); // this is local midnight

console.log("UTC date to en-CA string (can be offset by local TZ):", formatDate(utcDate));
console.log("Local date to en-CA string:", formatDate(localDate));
