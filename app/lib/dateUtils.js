// export const getToday = () => {
//   return new Date().toISOString().split("T")[0];
// };
export const getToday = () => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
};

export const getTodayDate = () => {
  return new Date(getToday());
};

export const formatDate = (date) => {
  return date.toLocaleDateString("en-CA");
};

export const getDatesBetween = (startDateStr, endDateStr, maxDays = 30) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // Set time to 0 to avoid local timezone offset issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let current = new Date(start);
  let daysAdded = 0;

  // Capping the maximum missed days to prevent massive inserts
  // if a template is very old
  while (current <= end && daysAdded < maxDays) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
    daysAdded++;
  }

  return dates;
};
