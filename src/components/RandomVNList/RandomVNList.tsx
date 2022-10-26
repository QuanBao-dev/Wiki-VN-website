import { useState } from "react";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import cachesStore from "../../store/caches";
import RandomVNItem from "../RandomVNItem/RandomVNItem";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";
import "./RandomVNList.css";
const RandomVNList = () => {
  const [randomVNList, setRandomVNList] = useState<VisualNovel[] | []>(
    cachesStore.currentState().caches.randomVNs || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useFetchApi(
    "/api/vndb/random",
    setRandomVNList,
    "randomVNs",
    [],
    true,
    cachesStore.currentState().caches.randomVNs &&
      cachesStore.currentState().caches.randomVNs.length === 0,
    setIsLoading
  );
  return (
    <ul className="random-vn-list-container">
      <h1>Random games</h1>
      {!isLoading &&
        randomVNList.map(
          ({ description, title, image, id, image_nsfw, screens }) => (
            <RandomVNItem
              key={id}
              title={title}
              image={image}
              id={id}
              description={description}
              image_nsfw={image_nsfw}
              screens={screens}
            />
          )
        )}
      {isLoading &&
        Array.from(Array(5).keys()).map((key) => (
          <SkeletonLoading
            key={key}
            LoadingComponent={undefined}
            height={150}
            width={"100%"}
            margin={5}
            isLoading={true}
          />
        ))}
    </ul>
  );
};

export default RandomVNList;
