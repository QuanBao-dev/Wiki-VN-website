import { useEffect, useState } from "react";
import { interval, takeWhile } from "rxjs";
import { Screen } from "../../Interfaces/visualNovelList";
import { generateUnrepeatedRandomNumber } from "../../util/generateRandomNumber";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface Props {
  screens: Partial<Screen>[];
  isNsfw: boolean;
}
const Gif = ({ screens, isNsfw = false }: Props) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const filteredScreens = screens.filter(({ nsfw, sexual, violence }) =>
      !isNsfw && sexual === 0 && violence === 0 ? nsfw === isNsfw : false
    );
    if (!filteredScreens[index]) setIndex(0);
    const subscription = interval(1000)
      .pipe(takeWhile(() => filteredScreens.length - 1 !== 0))
      .subscribe(() => {
        setIndex(generateUnrepeatedRandomNumber(filteredScreens.length - 1));
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isNsfw]);
  if (
    !screens ||
    !screens.filter(({ nsfw, sexual, violence }) =>
      !isNsfw && sexual === 0 && violence === 0 ? nsfw === isNsfw : false
    )[index]
  )
    return (
      <div>
        <LazyLoadImage
          src="https://www.siliconera.com/wp-content/uploads/2023/05/dlsite-ai.png?fit=1200%2C675"
          alt=""
        />
      </div>
    );
  return (
    <LazyLoadImage
      effect="opacity"
      src={screens
        .filter(({ nsfw, sexual, violence }) =>
          !isNsfw && sexual === 0 && violence === 0 ? nsfw === isNsfw : false
        )
        [index].image?.replace(/sf/g, "st")}
      alt=""
    />
  );
};

export default Gif;
