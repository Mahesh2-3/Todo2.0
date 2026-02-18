// export const getToday = () => {
//   return new Date().toISOString().split("T")[0];
// };
export const getToday = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

export const getTodayDate = () => {
  return new Date(getToday());
};

export const formatDate = (date) => {
  return date.toLocaleDateString("en-CA");
};
