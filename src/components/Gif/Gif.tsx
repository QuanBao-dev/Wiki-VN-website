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
    if (!filteredScreens[index]) setIndex(0);
    const subscription = interval(1000)
      .pipe(takeWhile(() => filteredScreens.length - 1 !== 0))
      .subscribe(() => {
        setIndex(
          generateUnrepeatedRandomNumber() * (filteredScreens.length - 1)
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

let temp = 1000;
function generateUnrepeatedRandomNumber() {
  let rand = Math.round(Math.random());
  while (temp === rand) {
    rand = Math.round(Math.random());
  }
  temp = rand;
  return rand;
}

export default Gif;
