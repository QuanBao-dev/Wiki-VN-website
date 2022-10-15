import "./CardItemVN.css";

import { Link } from "react-router-dom";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useEffect, useRef } from "react";
import { parseDescription } from "../../util/parseDescription";
interface Props extends VisualNovel {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  isNsfw: boolean;
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
  useEffect(() => {
    descriptionRef.current.innerHTML = parseDescription(description as string);
  }, [description]);
  return (
    <Link to={`/vns/${id}`} className="card-item-vn-container">
      <div className="container-image-frame">
        <img
          src={
            !isNsfw
              ? image
              : screens && screens[0]
              ? screens.filter(({ nsfw }) => !nsfw)[0].image
              : "/nsfw-warning.webp"
          }
          alt=""
          onLoad={() => {
            if (setTrigger) setTrigger(!trigger);
          }}
        ></img>
      </div>
      <div className="card-item-vn-wrapper">
        <h1>{title}</h1>
        <div className="description" ref={descriptionRef}></div>
      </div>
    </Link>
  );
};

export default CardItemVN;
