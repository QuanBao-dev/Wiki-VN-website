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
    setVotes(data.votes || 0);
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
          let temp = votes;
          setVotes(++temp);
          setTrigger(!trigger);
        } else {
          return alert("Require login to use this feature");
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
          let temp = votes;
          setVotes(--temp);
          setTrigger(!trigger);
        } else {
          if (v.error === "Access Denied") {
            alert("Require login to use this feature");
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
    if (isHide) votesParagraphRef.current.style.display = "none";
    if (!isHide) votesParagraphRef.current.style.display = "block";
  }, [isHide]);
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
