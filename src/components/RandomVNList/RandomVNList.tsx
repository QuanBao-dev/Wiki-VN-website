import { useState } from "react";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import RandomVNItem from "../RandomVNItem/RandomVNItem";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";
import "./RandomVNList.css";
const RandomVNList = () => {
  const [randomVNList, setRandomVNList] = useState<VisualNovel[] | []>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useFetchApi(
    "/api/vndb/random",
    setRandomVNList,
    "VNs",
    [],
    true,
    true,
    setIsLoading
  );

  return (
    <ul className="random-vn-list-container">
      <h1>Random games</h1>
      {!isLoading &&
        randomVNList.map(({ description, title, image, id }) => (
          <RandomVNItem
            key={id}
            title={title}
            image={image}
            id={id}
            description={description}
          />
        ))}
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
