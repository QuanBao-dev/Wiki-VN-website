import { useEffect, useState } from "react";
import { interval, takeWhile } from "rxjs";
import { Screen } from "../../Interfaces/visualNovelList";

interface Props {
  screens: Partial<Screen>[];
  isNsfw: boolean;
}
const Gif = ({ screens, isNsfw = false }: Props) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const filteredScreens = screens.filter(({ nsfw }) =>
      !isNsfw ? nsfw === isNsfw : true
    );
    const subscription = interval(1000)
      .pipe(takeWhile(() => filteredScreens.length - 1 !== 0))
      .subscribe(() => {
        setIndex(
          Math.round(Math.abs(Math.random()) * (filteredScreens.length - 1))
        );
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isNsfw]);
  if (
    !screens ||
    !screens.filter(({ nsfw }) => (!isNsfw ? nsfw === isNsfw : true))[index]
  )
    return <div></div>;
  return (
    <img
      src={
        screens.filter(({ nsfw }) => (!isNsfw ? nsfw === isNsfw : true))[index]
          .image
      }
      alt=""
    ></img>
  );
};

export default Gif;
