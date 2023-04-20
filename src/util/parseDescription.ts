export const parseDescription = (description: string) => {
  if (!description || description.trim() === "") return "No description";
  description = description
    .replace(/URL/gi, "url")
    .replace(/(\[\/url)?\]\]/g, "[/url]]");
  if (description.match(/\[([ a-zA-Z0-9]+)?From/gi)) {
    const text = (description.match(/\[([ a-zA-Z0-9]+)?From/gi) as any)[0];
    description = description.replace(/\[([ a-zA-Z0-9]+)?From/gi, text.replace("[","("));
  }
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
