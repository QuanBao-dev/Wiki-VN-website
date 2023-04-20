export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  description = description
    .replace(/(\[\/url)?\]\]/g, "[/url]]")
    .replace(/\[From/g, "( From");
  return description
    .replace(/=(https:\/\/vndb.org)?\/p/g, "=https://vndb.org/p")
    .replace(/=(https:\/\/vndb.org)?\/g/g, "=https://vndb.org/g")
    .replace(/=(https:\/\/vndb.org)?\/s/g, "=https://vndb.org/s")
    .replace(/=(https:\/\/vndb.org)?\/c/g, "=https://vndb.org/c")
    .replace(/\[/g, "<")
    .replace(/\]/g, ">")
    .replace(/url=/g, 'a target="_blank" rel="noreferrer" href=')
    .replace(/<\/url>/g, "</a>")
    .replace(/>>/g, "> )");
};
