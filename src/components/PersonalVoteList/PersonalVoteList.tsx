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

const PersonalVoteList = () => {
  const [dataPersonalVote, setDataPersonalVote] = useState<VisualNovel[]>(
    cachesStore.currentState().caches.personalVoteVN || []
  );
  const [maxVotes, setMaxVotes] = useState(
    homeStore.currentState().maxVotesPersonalVN || 0
  );
  const [isLoadingPersonalVN, setIsLoadingPersonalVN] = useState(
    homeStore.currentState().isLoadingPersonalVN
  );
  const [page, setPage] = useState(
    homeStore.currentState().votesPagePersonalVN || 0
  );
  const [isStopFetchingPersonalVN, setIsStopFetchingPersonalVN] = useState(
    homeStore.currentState().isStopFetchingPersonalVN
  );
  const personalVnContainerRef = useRef(document.createElement("div"));

  useEffect(() => {
    const voteList = dataPersonalVote.map(({ votes }) => {
      return votes || 0;
    });
    if (Math.abs(Math.max(...voteList)) !== Infinity) {
      setMaxVotes(Math.max(...voteList));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingPersonalVN]);
  useEffect(() => {
    homeStore.updateState({ maxVotes });
  }, [maxVotes]);

  useEffect(() => {
    const subscription = iif(
      () => isLoadingPersonalVN === true,
      timer(0).pipe(
        filter(() => !isStopFetchingPersonalVN),
        switchMap(() =>
          ajax({
            url: "/api/vote/personal/vns/?page=" + page,
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
            personalVnContainerRef.current &&
            personalVnContainerRef.current.getBoundingClientRect().height -
              window.innerHeight +
              personalVnContainerRef.current.getBoundingClientRect().top <=
              0 &&
            !isLoadingPersonalVN &&
            !isStopFetchingPersonalVN
        ),
        tap(() => {
          homeStore.updateState({
            votesPagePersonalVN: page + 1,
            isLoadingPersonalVN: true,
          });
          setPage(page + 1);
          setIsLoadingPersonalVN(true);
        }),
        filter(() => false)
      )
    ).subscribe((v) => {
      if (v && !v.error) {
        updateCaches(v, "VNs");
        setDataPersonalVote([...dataPersonalVote, ...v]);
        updateCaches([...dataPersonalVote, ...v], "personalVoteVN");
      } else {
        homeStore.updateState({ isStopFetchingPersonalVN: true });
        setIsStopFetchingPersonalVN(true);
      }
      homeStore.updateState({ isLoadingPersonalVN: false });
      setIsLoadingPersonalVN(false);
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoadingPersonalVN,
    page,
    isStopFetchingPersonalVN,
    dataPersonalVote.length,
  ]);

  return (
    <div className="personal-vn-container" ref={personalVnContainerRef}>
      {dataPersonalVote.map(
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
      {isLoadingPersonalVN &&
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

export default PersonalVoteList;
