const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function parseNumber(number: number) {
  return number < 10 ? "0" + number : number;
}

export const parseDate = (createdAt: string) => {
  return `${new Date(createdAt).getDate()}${" "}
  ${months[new Date(createdAt).getMonth()]} ,${" "}
  ${new Date(createdAt).getFullYear()} -${" "}
  ${parseNumber(new Date(createdAt).getHours())}:
  ${parseNumber(new Date(createdAt).getMinutes())}:
  ${parseNumber(new Date(createdAt).getSeconds())}
`;
};
