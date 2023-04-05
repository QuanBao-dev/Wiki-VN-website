import "./RandomVNItem.css";

import { useEffect, useRef } from "react";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { Link } from "react-router-dom";
import { parseDescription } from "../../util/parseDescription";
import { generateUnrepeatedRandomNumber } from "../../util/generateRandomNumber";
import { userStore } from "../../store/user";

interface Props extends VisualNovel {}
const RandomVNItem = ({
  id,
  image,
  title,
  image_nsfw,
  description,
  screens,
}: Partial<Props>) => {
  const descriptionRef = useRef(document.createElement("p"));
  const randomRef = useRef(0);
  useEffect(() => {
    descriptionRef.current.innerHTML =
      parseDescription(description as string)
        .split(" ")
        .slice(0, 40)
        .join(" ") +
      (parseDescription(description as string).split(" ").length > 40
        ? "..."
        : "");
    if (screens)
      randomRef.current = generateUnrepeatedRandomNumber(
        screens.filter(({ nsfw }) => !nsfw).length - 1
      );
    descriptionRef.current.style.marginBottom = description
      ? descriptionRef.current.style.marginBottom
      : "5rem";
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <img
          src={
            !image_nsfw || !userStore.currentState().isFilterNsfw
              ? image
              : screens &&
                screens.filter(({ nsfw }) => !nsfw)[randomRef.current]
              ? screens.filter(({ nsfw }) => !nsfw)[randomRef.current].image
              : "/nsfw-warning.webp"
          }
          alt=""
        ></img>
        <h4>{title}</h4>
        <p ref={descriptionRef}></p>
      </li>
    </Link>
  );
};

export default RandomVNItem;
