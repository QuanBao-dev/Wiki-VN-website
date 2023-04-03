export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  if (
    description.match(/((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~]+)/g) &&
    !description.match(/\[url=((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:]+)\]/g)
  ) {
    const url = (
      description.match(/((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~]+)/g) as any
    )[0];
    const editedUrl = `[url=${url}]${url.split("/")[2]}[/url]`;
    description = description.replace(
      /((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~]+)/g,
      editedUrl
    );
  }
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
