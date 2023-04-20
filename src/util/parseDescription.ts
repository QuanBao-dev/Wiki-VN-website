export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  description = description.replace(/(\[\/url)?\]\]/g,"[/url]]")
  if (description.includes(".jpg"))
    return description
      .replace(/\[/g, "<")
      .replace(/\]/g, ">")
      .replace(/url=/g, 'a target="_blank" rel="noreferrer" href=')
      .replace(/<\/url>/g, "</a>");
  while (
    description.match(
      /\[url=((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)\].+\[\/url]/
    )
  ) {
    if (
      description.match(/((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/) &&
      !description.match(
        /\[url=((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)\]/
      )
    ) {
      const url = (
        description.match(
          /((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/
        ) as any
      )[0];
      const editedUrl = `[url=${url}]${url.split("/")[2]}[/url]`;
      description = description.replace(
        /((http(s?)):\/\/[a-z~0-9A-Z\-_./&?=#%@:~\\(\\)]+)/,
        editedUrl
      );
    }
    const matchedUrlList = description.match(/\[url=.+\].+\[\/url]/);
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

    description = description.replace(/\[url=.+\].+\[\/url]/, temp);
  }
  return description;
};
