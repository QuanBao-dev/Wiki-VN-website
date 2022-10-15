export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  const matchedUrlList = description.match(/\[url=.+\].+\[\/url]/g);
  let matchedUrl = "";
  if (matchedUrlList) matchedUrl = matchedUrlList[0];

  const temp = matchedUrl
    .replace(/\[/g, "<")
    .replace(/\]/g, ">")
    .replace("url=", "a href=")
    .replace("</url>", "</a>");

  return description.replace(/\[url=.+\].+\[\/url]/g, temp);
};
