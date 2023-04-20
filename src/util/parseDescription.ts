export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  description = description
    .replace(/URL/gi, "url")
    .replace(/(\[\/url)?\]\]/g, "[/url]]")
    .replace(/\[From/gi, "(From")
    .replace(/\[Edited from/gi, "(Edited From")
    .replace(/\[Translated from/gi, "(Translated From");
  return description
    .replace(/=(https:\/\/vndb.org)?\/p/g, "=https://vndb.org/p")
    .replace(/=(https:\/\/vndb.org)?\/g/g, "=https://vndb.org/g")
    .replace(/=(https:\/\/vndb.org)?\/s/g, "=https://vndb.org/s")
    .replace(/=(https:\/\/vndb.org)?\/c/g, "=https://vndb.org/c")
    .replace(/\[/g, "<")
    .replace(/\]/g, ">")
    .replace(/url=/g, 'a target="_blank" rel="noreferrer" href=')
    .replace(/<\/url>/g, "</a>")
    .replace(/>>/g, ">)");
};
