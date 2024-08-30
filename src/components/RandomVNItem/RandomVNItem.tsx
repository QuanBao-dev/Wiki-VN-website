import "./RandomVNItem.css";

import { useEffect, useRef } from "react";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { Link } from "react-router-dom";
import { parseDescription } from "../../util/parseDescription";
import { generateUnrepeatedRandomNumber } from "../../util/generateRandomNumber";
import { userStore } from "../../store/user";
import { LazyLoadImage } from "react-lazy-load-image-component";

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
        screens.filter(
          ({ nsfw, sexual, violence }) =>
            !nsfw && sexual === 0 && violence === 0
        ).length - 1
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
        <LazyLoadImage
          src={
            !image_nsfw || !userStore.currentState().isFilterNsfw
              ? image
              : screens &&
                screens.filter(
                  ({ nsfw, sexual, violence }) =>
                    !nsfw && sexual === 0 && violence === 0
                )[randomRef.current]
              ? screens
                  .filter(
                    ({ nsfw, sexual, violence }) =>
                      !nsfw && sexual === 0 && violence === 0
                  )
                  [randomRef.current].image.replace(/sf/g, "st")
              : "/background.jpg"
          }
          alt=""
          effect="opacity"
        />
        <h4>{title}</h4>
        <p ref={descriptionRef}></p>
      </li>
    </Link>
  );
};

export default RandomVNItem;
