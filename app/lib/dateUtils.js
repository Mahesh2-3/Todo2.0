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
