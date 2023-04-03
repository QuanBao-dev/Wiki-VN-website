import { useEffect } from 'react';

import { VisualNovel } from './../../Interfaces/visualNovelList';

export function useCardListVNPosition(
  cardListVnContainerRef: React.MutableRefObject<HTMLElement>,
  list: VisualNovel[],
  trigger: boolean,
  page: number,
  indexActive: number,
  numberOfColumn: number
) {
  let margin = 10;
  useEffect(() => {
    handleCardItem(cardListVnContainerRef, numberOfColumn, margin).then(() => {
      const listChild = [...cardListVnContainerRef.current.children];
      listChild.forEach((child) => {
        const temp = child as HTMLElement;
        temp.style.transition = "0.5s";
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, trigger, page, indexActive, numberOfColumn]);
}
async function handleCardItem(
  cardListVnContainerRef: any,
  numberOfColumn: number,
  margin: number
) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      if (!cardListVnContainerRef.current) rej("error");
      const listChild = [...cardListVnContainerRef.current.children];
      let rowIndex = -1;
      let columnIndex = 0;
      let sumColumnList = Array.from(Array(numberOfColumn).keys()).map(() => 0);
      listChild.forEach((child, index) => {
        const temp = child as HTMLElement;
        temp.style.transition = "0s";
        temp.style.maxWidth = `${
          cardListVnContainerRef.current.offsetWidth / (numberOfColumn + 0.05)
        }px`;
        if (index % numberOfColumn === 0) {
          columnIndex = 0;
          rowIndex++;
        }
        temp.style.left = `${
          (cardListVnContainerRef.current.offsetWidth /
            (numberOfColumn + 0.05)) *
            columnIndex +
          margin * columnIndex
        }px`;
        let sum = 0;
        sumColumnList[columnIndex] += temp.offsetHeight + margin;
        for (let i = 0; i < rowIndex; i++) {
          const temp3 = listChild[
            i * numberOfColumn + columnIndex
          ] as HTMLElement;
          const temp2 = listChild[rowIndex * numberOfColumn + columnIndex];
          if (columnIndex === 0 && temp3.querySelector(".description")) {
            (
              temp3.querySelector(".description") as HTMLElement
            ).style.webkitLineClamp = "5";
            (
              temp2.querySelector(".description") as HTMLElement
            ).style.webkitLineClamp = "4";
          }
          sum += temp3.offsetHeight;
        }
        temp.style.top = `${sum + margin * rowIndex}px`;
        columnIndex++;
      });
      cardListVnContainerRef.current.style.height =
        Math.max(...sumColumnList) > 0
          ? `${Math.max(...sumColumnList)}px`
          : "fit-content";
      res("Done");
    }, 100);
  });
}
