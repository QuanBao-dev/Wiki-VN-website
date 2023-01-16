import "./Votes.css";

import { useEffect, useRef, useState } from "react";
import {
  catchError,
  debounceTime,
  fromEvent,
  switchMap,
  of,
  pluck,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import { homeStore } from "../../store/home";
import { updateCaches } from "../../util/updateCaches";
import { userStore } from "../../store/user";
interface Props {
  vnId: number;
  dataVN: VisualNovel;
}
const Votes = ({ vnId, dataVN }: Props) => {
  const [data, setData] = useState({ votes: 0 } as any);
  const [votes, setVotes] = useState(0);
  const [trigger, setTrigger] = useState(false);
  const upVotesRef = useRef(document.createElement("i"));
  const downVotesRef = useRef(document.createElement("i"));
  const votesParagraphRef = useRef(document.createElement("div"));
  const isIncreasedRef = useRef<boolean | null>(null);
  const [isHide, setIsHide] = useState(true);
  useFetchApi(
    "/api/vote/" + vnId,
    setData,
    "patches",
    [vnId, trigger],
    true,
    true,
    undefined,
    100
  );
  useEffect(() => {
    if (!data.votes) return setVotes(0);
    setVotes(data.votes);
    if (isIncreasedRef.current === true) {
      setVotes(data.votes - 1 + userStore.currentState().boost);
    }
    if (isIncreasedRef.current === false) {
      setVotes(data.votes + 1 - userStore.currentState().boost);
    }
  }, [data.votes]);
  useEffect(() => {
    if (!upVotesRef.current) return;
    const subscription = fromEvent(upVotesRef.current, "click")
      .pipe(
        debounceTime(1000),
        switchMap(() =>
          ajax({
            method: "PUT",
            url: "/api/vote/" + vnId,
            body: {
              dataVN,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (v && !v.error) {
          updateCaches([], "rankingVNs");
          homeStore.updateState({
            isStopFetching: false,
            isLoading: true,
            votesPage: 0,
          });
          isIncreasedRef.current = true;
          let temp = votes;
          setVotes(temp + userStore.currentState().boost);
          setTrigger(!trigger);
        } else {
          return alert(
            "Require login to use this feature"
          );
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vnId, votes]);
  useEffect(() => {
    if (!downVotesRef.current) return;
    const subscription = fromEvent(downVotesRef.current, "click")
      .pipe(
        debounceTime(1000),
        switchMap(() =>
          ajax({
            method: "PUT",
            url: "/api/vote/" + vnId,
            body: {
              dataVN,
              isDownVotes: true,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (v && !v.error) {
          updateCaches([], "rankingVNs");
          homeStore.updateState({
            isStopFetching: false,
            isLoading: true,
            votesPage: 0,
          });
          isIncreasedRef.current = false;
          let temp = votes;
          setVotes(temp - userStore.currentState().boost);
          setTrigger(!trigger);
        } else {
          if (v.error === "Access Denied") {
            alert(
              "Require login to use this feature, and this feature only is only for member and supporter"
            );
          }
          alert(v.error);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vnId, votes]);
  useEffect(() => {
    if (!votesParagraphRef.current) return;
    if (isHide) votesParagraphRef.current.style.display = "none";
    if (!isHide) votesParagraphRef.current.style.display = "block";
  }, [isHide]);
  if (data && data.reason && data.reason.trim() !== "" && !data.isTranslatable)
    return (
      <fieldset>
        <legend>Reason for not translating this game</legend>
        <h3
          style={{
            color: "red",
            padding: "1rem",
            borderRadius: "10px",
            textTransform: "uppercase",
          }}
        >
          {data.reason}
        </h3>
      </fieldset>
    );
  if (data.isTranslatable === false) return <div></div>;
  return (
    <fieldset className="votes-container">
      <legend>Votes</legend>
      <button
        className="button-notes"
        onClick={() => {
          setIsHide(!isHide);
        }}
        style={{
          backgroundColor: isHide ? "gray" : "purple",
        }}
      >
        Notes
      </button>
      <i
        className="fas fa-chevron-up"
        ref={upVotesRef}
        style={{ display: !data.isIncreased ? "block" : "none" }}
      ></i>
      <div className="votes-number">{votes}</div>
      <i
        className="fas fa-chevron-down"
        ref={downVotesRef}
        style={{ display: data.isIncreased ? "block" : "none" }}
      ></i>

      <div className="votes-paragraph" ref={votesParagraphRef}>
        * The more number of votes the VN obtains, the higher chance it will get
        to be picked up to translate
      </div>
    </fieldset>
  );
};

export default Votes;
