export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  if (
    description.match(/((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/g) &&
    !description.match(
      /\[url=((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)\]/g
    )
  ) {
    const url = (
      description.match(
        /((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/g
      ) as any
    )[0];
    const editedUrl = `[url=${url}]${url.split("/")[2]}[/url]`;
    description = description.replace(
      /((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/g,
      editedUrl
    );
  }
  const matchedUrlList = description.match(/\[url=.+\].+\[\/url]/g);
  let matchedUrl = "";
  if (matchedUrlList) matchedUrl = matchedUrlList[0];

  const temp = matchedUrl
    .replace(/\[/g, "<")
    .replace(/\]/g, ">")
    .replace("url=", 'a target="_blank" rel="noreferrer" href=')
    .replace("</url>", "</a>")
    .replace(/(https:\/\/vndb.org)?\/p/g, "https://vndb.org/p")
    .replace(/(https:\/\/vndb.org)?\/g/g, "https://vndb.org/g")
    .replace(/(https:\/\/vndb.org)?\/s/g, "https://vndb.org/s")
    .replace(/(https:\/\/vndb.org)?\/c/g, "https://vndb.org/c");

  return description.replace(/\[url=.+\].+\[\/url]/g, temp);
};
