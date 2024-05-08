import { VisualNovel } from "../../Interfaces/visualNovelList";
import { parseDescription } from "../../util/parseDescription";
import { useEffect, useRef } from "react";
import "./RankingVNItem.css";
import { Link } from "react-router-dom";
import { userStore } from "../../store/user";
import { LazyLoadImage } from "react-lazy-load-image-component";
interface Props extends Partial<VisualNovel> {
  maxVotes: number;
}
const RankingVNItem = ({
  image,
  screens,
  image_nsfw,
  votes = 0,
  maxVotes,
  description = "",
  title,
  id,
}: Props) => {
  const descriptionRef = useRef(document.createElement("div"));
  useEffect(() => {
    descriptionRef.current.innerHTML = parseDescription(description);
  }, [description]);
  return (
    <Link to={`/vns/${id}`} className="ranking-vn-item">
      <div className="ranking-vn-image-container">
        <LazyLoadImage
          effect="opacity"
          src={
            !image_nsfw || !userStore.currentState().isFilterNsfw
              ? image
              : screens && screens.filter(({ nsfw }) => !nsfw)[0]
              ? screens.filter(({ nsfw }) => !nsfw)[0].image
              : "/background.jpg"
          }
          alt=""
        />
      </div>
      <div className="ranking-vn-image-progress">
        <h2>{title}</h2>
        <p ref={descriptionRef}></p>
        <div className="progress-bar-container">
          <label>{votes} votes</label>
          <div
            className="progress-bar"
            style={{
              width: `${(votes / maxVotes) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </Link>
  );
};

export default RankingVNItem;
