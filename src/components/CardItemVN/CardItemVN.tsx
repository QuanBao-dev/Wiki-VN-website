import "./CardItemVN.css";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { userStore } from "../../store/user";
import { generateUnrepeatedRandomNumber } from "../../util/generateRandomNumber";
import { parseDescription } from "../../util/parseDescription";

interface Props extends VisualNovel {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  isNsfw: boolean;
  isNormal: boolean;
}
const CardItemVN = ({
  title,
  description,
  image,
  id,
  trigger,
  setTrigger,
  isNsfw,
  screens,
}: Partial<Props>) => {
  const descriptionRef = useRef(document.createElement("div"));
  const randomRef = useRef(0);
  useEffect(() => {
    descriptionRef.current.innerHTML = parseDescription(description as string);
    if (screens)
      randomRef.current = generateUnrepeatedRandomNumber(
        screens.filter(({ nsfw }) => !nsfw).length - 1
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);
  return (
    <Link to={`/vns/${id}`} className="card-item-vn-container">
      <div className="container-image-frame">
        <img
          src={
            !isNsfw || !userStore.currentState().isFilterNsfw
              ? image
              : screens &&
                screens.filter(({ nsfw }) => !nsfw)[randomRef.current]
              ? screens
                  .filter(({ nsfw }) => !nsfw)
                  [randomRef.current].image.replace(/sf/g, "st")
              : "/nsfw-warning.webp"
          }
          alt=""
          onLoad={() => {
            if (setTrigger) setTrigger(!trigger);
          }}
        />
      </div>
      <div className="card-item-vn-wrapper">
        <h1>{title}</h1>
        <div className="description" ref={descriptionRef}></div>
      </div>
    </Link>
  );
};

export default CardItemVN;
