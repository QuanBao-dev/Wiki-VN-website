import "./RankingVN.css";

import { useEffect, useRef, useState } from "react";
import {
  catchError,
  filter,
  fromEvent,
  iif,
  of,
  pluck,
  switchMap,
  tap,
  timer,
} from "rxjs";
import { ajax } from "rxjs/ajax";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import cachesStore from "../../store/caches";
import { homeStore } from "../../store/home";
import { updateCaches } from "../../util/updateCaches";
import RankingVNItem from "../RankingVNItem/RankingVNItem";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";

const RankingVN = ({ isLowTier }: { isLowTier: boolean }) => {
  const [dataRankingVN, setDataRankingVN] = useState<VisualNovel[]>(
    cachesStore.currentState().caches[
      "rankingVNs" + (isLowTier ? "Low" : "")
    ] || []
  );
  const [maxVotes, setMaxVotes] = useState(
    homeStore.currentState().maxVotes || 0
  );
  const [isLoading, setIsLoading] = useState(
    homeStore.currentState().isLoading
  );
  const [page, setPage] = useState(homeStore.currentState().votesPage || 0);
  const [isStopFetching, setIsStopFetching] = useState(
    homeStore.currentState().isStopFetching
  );
  const rankingVnContainerRef = useRef(document.createElement("div"));
  useEffect(() => {
    const voteList = dataRankingVN.map(({ votes }) => {
      return votes || 0;
    });
    if (Math.abs(Math.max(...voteList)) !== Infinity) {
      setMaxVotes(Math.max(...voteList));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, dataRankingVN]);
  useEffect(() => {
    homeStore.updateState({ maxVotes });
  }, [maxVotes]);
  useEffect(() => {
    const dataRanking =
      cachesStore.currentState().caches[
        "rankingVNs" + (isLowTier ? "Low" : "")
      ] || [];
    setDataRankingVN(
      cachesStore.currentState().caches[
        "rankingVNs" + (isLowTier ? "Low" : "")
      ] || []
    );
    setIsLoading(dataRanking.length === 0 ? true : false);
    setIsStopFetching(
      isLowTier
        ? homeStore.currentState().isStopFetchingVNLow
        : homeStore.currentState().isStopFetching
    );
    setPage(
      isLowTier
        ? homeStore.currentState().votesPageLowRank
        : homeStore.currentState().votesPage
    );
  }, [isLowTier]);

  useEffect(() => {
    const subscription = iif(
      () => isLoading === true,
      timer(0).pipe(
        filter(() => !isStopFetching),
        switchMap(() =>
          ajax({
            url:
              "/api/vote?page=" + page + (isLowTier ? "&isLowTier=true" : ""),
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      ),
      fromEvent(window, "scroll").pipe(
        // debounceTime(500),
        filter(
          () =>
            rankingVnContainerRef.current &&
            rankingVnContainerRef.current.getBoundingClientRect().height -
              window.innerHeight +
              rankingVnContainerRef.current.getBoundingClientRect().top <=
              0 &&
            !isLoading &&
            !isStopFetching
        ),
        tap(() => {
          if (!isLowTier)
            homeStore.updateState({ votesPage: page + 1, isLoading: true });
          else
            homeStore.updateState({
              votesPageLowRank: page + 1,
              isLoading: true,
            });
          setPage(page + 1);
          setIsLoading(true);
        }),
        filter(() => false)
      )
    ).subscribe((v) => {
      if (v && !v.error) {
        updateCaches(v, "VNs");
        setDataRankingVN([...dataRankingVN, ...v]);
        updateCaches(
          [...dataRankingVN, ...v],
          "rankingVNs" + (isLowTier ? "Low" : "")
        );
      } else {
        homeStore.updateState({ isStopFetching: true });
        setIsStopFetching(true);
      }
      homeStore.updateState({ isLoading: false });
      setIsLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, page, isStopFetching, dataRankingVN.length, isLowTier]);

  return (
    <div className="ranking-vn-container" ref={rankingVnContainerRef}>
      {dataRankingVN.map(
        (
          { image, votes, description, title, id, screens, image_nsfw },
          key
        ) => (
          <RankingVNItem
            key={key}
            image={image}
            votes={votes || 0}
            maxVotes={maxVotes}
            image_nsfw={image_nsfw}
            description={description}
            title={title}
            id={id}
            screens={screens}
          />
        )
      )}
      {isLoading &&
        Array.from(Array(5).keys()).map((_, key) => (
          <SkeletonLoading
            key={key}
            LoadingComponent={undefined}
            height={300}
            width={"100%"}
            isLoading={true}
            margin={3}
          />
        ))}
    </div>
  );
};

export default RankingVN;
