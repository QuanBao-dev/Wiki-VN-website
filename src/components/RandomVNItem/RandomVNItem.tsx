import "./RandomVNItem.css";

import { useEffect, useRef } from "react";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { Link } from "react-router-dom";

interface Props extends VisualNovel {}
const RandomVNItem = ({ id, image, title, description }: Partial<Props>) => {
  const descriptionRef = useRef(document.createElement("p"));
  useEffect(() => {
    descriptionRef.current.innerHTML = description
      ? description
          .replace("[From", "From")
          .replace(/url/g, "a href")
          .replace(/\](\])?/g, ">")
          .replace(/\[/g, "<")
          .split(" ")
          .slice(0, 40)
          .join(" ") + "..."
      : "No description";
    descriptionRef.current.style.marginBottom = description
      ? descriptionRef.current.style.marginBottom
      : "5rem";
  }, [description]);
  return (
    <Link
      to={"/vns/" + id}
      style={{
        textDecoration: "none",
        color: "black",
      }}
    >
      <li className="random-vn-item" key={id}>
        <img src={image} alt=""></img>
        <h4>{title}</h4>
        <p ref={descriptionRef}></p>
      </li>
    </Link>
  );
};

export default RandomVNItem;
