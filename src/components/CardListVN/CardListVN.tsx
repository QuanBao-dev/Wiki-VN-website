import "./CardListVN.css";

import React, { useEffect, useRef, Suspense } from "react";
import { useState } from "react";
import { debounceTime, fromEvent } from "rxjs";
import { Dbstats } from "../../Interfaces/dbstats";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useCardListVNPosition } from "../../pages/Hooks/useCardListVN";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import cachesStore from "../../store/caches";
import { homeStore } from "../../store/home";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";
import PersonalVoteList from "../PersonalVoteList/PersonalVoteList";
import { userStore } from "../../store/user";
const RankingVN = React.lazy(() => import("../RankingVN/RankingVN"));
const CardItemVN = React.lazy(() => import("../CardItemVN/CardItemVN"));
const CardListVN = () => {
  const cardListVnContainerRef = useRef(document.createElement("div"));
  const [trigger, setTrigger] = useState<boolean>(true);
  const [indexActive, setIndexActive] = useState(
    homeStore.currentState().indexActive
  );
  const [indexPollModeActive, setIndexPollModeActive] = useState(
    homeStore.currentState().indexPollModeActive
  );
  const selectPageRef = useRef(document.createElement("select"));
  const [visualNovelList, setVisualNovelList] = useState<VisualNovel[] | []>(
    []
  );
  const [numberOfColumn, setNumberOfColumn] = useState(3);
  const [page, setPage] = useState(
    indexActive === 1
      ? homeStore.currentState().page
      : homeStore.currentState().patchesPage
  );
  const [triggerFetching, setTriggerFetching] = useState(true);
  const [dbStats, setDbStats] = useState<Partial<Dbstats>>(
    cachesStore.currentState().caches.dbStats || {}
  );

  const [isLoading, setIsLoading] = useState(
    indexActive === 1
      ? (cachesStore.currentState() as any).caches.VNs &&
          !(cachesStore.currentState() as any).caches.VNs[page * 10 + 2]
      : cachesStore.currentState().caches.VNs &&
          !(
            Object.values(cachesStore.currentState().caches.VNs)
              .filter((v: any) => v.isPatchContained)
              .reduce((ans: any, curr: any) => {
                ans[curr.index] = curr;
                return ans;
              }, {}) as any
          )[page * 10]
  );
  // useInitStore(homeStore,setHomeState);
  useEffect(() => {
    if (window.innerWidth > 1130) {
      setNumberOfColumn(3);
    }
    if (window.innerWidth <= 1130) {
      setNumberOfColumn(2);
    }
  }, []);

  useEffect(() => {
    const subscription = fromEvent(window, "resize")
      .pipe(debounceTime(500))
      .subscribe(() => {
        if (window.innerWidth > 1130) {
          setNumberOfColumn(3);
          setTrigger(!trigger);
          return;
        }

        if (window.innerWidth <= 1130) {
          setNumberOfColumn(2);
          setTrigger(!trigger);
          return;
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [trigger]);
  useFetchApi(
    "/api/vndb/stats",
    setDbStats,
    "dbStats",
    [indexActive],
    true,
    indexActive === 1 &&
      (cachesStore.currentState() as any).caches.dbStats &&
      !(cachesStore.currentState() as any).caches.dbStats.vn
  );
  // useFetchApi(
  //   "/api/patch/stats",
  //   setPatchStats,
  //   "patchStats",
  //   [],
  //   true,
  //   indexActive === 0 &&
  //     (cachesStore.currentState() as any).caches.patchStats &&
  //     !(cachesStore.currentState() as any).caches.patchStats.vn
  // );

  useFetchApi(
    `/api/vndb?id=${page * 10 + 1}&isLarger=true`,
    setVisualNovelList,
    "VNs",
    [triggerFetching],
    true,
    indexActive === 1 &&
      cachesStore.currentState().caches.VNs &&
      !cachesStore.currentState().caches.VNs[page * 10 + 2],
    setIsLoading
  );

  useFetchApi(
    `/api/patch?page=${page}`,
    setVisualNovelList,
    "VNs",
    [page],
    true,
    indexActive === 0 &&
      cachesStore.currentState().caches.VNs &&
      !(
        Object.values(cachesStore.currentState().caches.VNs)
          .filter((v: any) => v.isPatchContained)
          .reduce((ans: any, curr: any) => {
            ans[curr.index] = curr;
            return ans;
          }, {}) as any
      )[page * 10],
    setIsLoading
  );

  useCardListVNPosition(
    cardListVnContainerRef,
    visualNovelList,
    trigger,
    page,
    indexActive,
    numberOfColumn
  );
  useEffect(() => {
    homeStore.updateState({
      currentScrollTop: 0,
    });
    selectPageRef.current.value = (page + 1).toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useEffect(() => {
    setTriggerFetching(!triggerFetching);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, indexActive, indexPollModeActive]);
  useEffect(() => {
    if (indexActive === 1) {
      homeStore.updateState({
        lastPage: Math.ceil((dbStats.vn || 0) / 10),
        page,
      });
    } else {
      homeStore.updateState({
        lastPage: Math.ceil(
          (homeStore.currentState().stats.mtledVNLength || 0) / 10
        ),
        patchesPage: page,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useEffect(() => {
    if (indexActive === 1) {
      setPage(homeStore.currentState().page);
      if ((cachesStore.currentState() as any).caches.VNs) {
        setVisualNovelList(
          (
            Object.values((cachesStore.currentState() as any).caches.VNs) as any
          ).filter(({ id }: any) => id > page * 10 && id <= (page + 1) * 10)
        );
      }
    }
    if (indexActive === 0) {
      setPage(homeStore.currentState().patchesPage);
      if ((cachesStore.currentState() as any).caches.VNs) {
        const object = Object.values(cachesStore.currentState().caches.VNs)
          .filter((v: any) => v.isPatchContained)
          .reduce((ans: any, curr: any) => {
            ans[curr.index] = curr;
            return ans;
          }, {}) as any;
        setVisualNovelList(
          (Object.keys(object) as any)
            .filter((key: any) => +key >= page * 10 && (page + 1) * 10 > +key)
            .map((key: any) => {
              return object[key];
            })
        );
      }
    }
  }, [
    dbStats.vn,
    page,
    indexActive,
    indexPollModeActive,
    visualNovelList.length,
  ]);
  let lastPage = 0;
  if (indexActive === 1) lastPage = Math.ceil(((dbStats.vn || 0) + 1646) / 10);
  if (indexActive === 0)
    lastPage = Math.ceil(
      (homeStore.currentState().stats.mtledVNLength || 0) / 10
    );
  return (
    <div className="card-list-vn-container">
      <div>
        <div className="card-list-toggle-mode">
          <div
            className={indexActive === 0 ? "active" : ""}
            onClick={() => {
              setIndexActive(0);
              homeStore.updateState({ indexActive: 0 });
            }}
          >
            Updated visual novels
          </div>
          <div
            className={indexActive === 1 ? "active" : ""}
            onClick={() => {
              setIndexActive(1);
              homeStore.updateState({ indexActive: 1 });
            }}
          >
            All visual novels
          </div>
          <div
            className={indexActive === 2 ? "active" : ""}
            onClick={() => {
              setIndexActive(2);
              homeStore.updateState({ indexActive: 2 });
            }}
          >
            Visual Novels Poll
          </div>
          {userStore.currentState().role && (
            <div
              className={indexActive === 3 ? "active" : ""}
              onClick={() => {
                setIndexActive(3);
                homeStore.updateState({ indexActive: 3 });
              }}
            >
              Your voted VNs
            </div>
          )}
          {/* <div
            className={indexActive === 4 ? "active" : ""}
            onClick={() => {
              setIndexActive(4);
              homeStore.updateState({ indexActive: 4 });
            }}
          >
            Early access VNs
          </div> */}
        </div>
        {indexActive === 2 && (
          <div className="card-list-toggle-mode">
            <div
              className={indexPollModeActive === 0 ? "active" : ""}
              onClick={() => {
                setIndexPollModeActive(0);
                homeStore.updateState({ indexPollModeActive: 0 });
              }}
            >
              Poll (1-200)
            </div>
            <div
              className={indexPollModeActive === 1 ? "active" : ""}
              onClick={() => {
                setIndexPollModeActive(1);
                homeStore.updateState({
                  indexPollModeActive: 1,
                });
              }}
            >
              Low tier poll (1-25)
            </div>
          </div>
        )}
      </div>
      <div
        className="card-list-vn-wrapper"
        ref={cardListVnContainerRef}
        style={{ display: [0, 1, 4].includes(indexActive) ? "block" : "none" }}
      >
        {!isLoading &&
          visualNovelList.map(
            ({ title, description, image, id, image_nsfw, screens }) => (
              <Suspense
                key={id}
                fallback={
                  <SkeletonLoading
                    isLoading={true}
                    height={300}
                    width={`${100 / numberOfColumn - 2}%`}
                    LoadingComponent={undefined}
                    margin={3}
                  />
                }
              >
                <CardItemVN
                  id={id}
                  title={title}
                  image={image}
                  description={description}
                  trigger={trigger}
                  setTrigger={setTrigger}
                  isNsfw={image_nsfw}
                  screens={screens}
                />
              </Suspense>
            )
          )}
        {isLoading &&
          Array.from(Array(10).keys()).map((key) => (
            <SkeletonLoading
              key={key}
              isLoading={true}
              height={300}
              width={`${100 / numberOfColumn - 2}%`}
              LoadingComponent={undefined}
              margin={3}
            />
          ))}
      </div>
      {indexActive === 2 && (
        <Suspense
          fallback={
            <SkeletonLoading
              isLoading={true}
              height={300}
              width={`${100}%`}
              LoadingComponent={undefined}
              margin={3}
            />
          }
        >
          <RankingVN isLowTier={indexPollModeActive === 1} />
        </Suspense>
      )}
      {indexActive === 3 && (
        <Suspense
          fallback={
            <SkeletonLoading
              isLoading={true}
              height={300}
              width={`${100}%`}
              LoadingComponent={undefined}
              margin={3}
            />
          }
        >
          <PersonalVoteList />
        </Suspense>
      )}
      <div
        className="card-list-page-list"
        style={{
          display: lastPage > 1 ? "flex" : "none",
        }}
      >
        <span
          className="card-list-page-item"
          onClick={() => {
            setPage(0);
            window.scroll({ top: 0 });
          }}
        >
          <i className="fas fa-chevron-left"></i>
          <i className="fas fa-chevron-left"></i>
        </span>
        {Array.from(Array(lastPage).keys())
          .slice(
            page - 5 > 0 ? page - 5 : 0,
            page + 5 < lastPage ? page + 5 : lastPage + 1
          )
          .map((name, key) => {
            return (
              <span
                className={`card-list-page-item${
                  name === page ? " active" : ""
                }`}
                key={key}
                onClick={() => {
                  setPage(name);
                  window.scroll({ top: 0 });
                }}
              >
                {typeof name === "number" ? name + 1 : name}
              </span>
            );
          })}
        <select
          className="card-list-page-item"
          ref={selectPageRef}
          onChange={(e) => {
            setPage(+e.target.value - 1);
            window.scroll({ top: 0 });
          }}
        >
          {Array.from(Array(lastPage).keys()).map((number, key) => (
            <option key={key}>{number + 1}</option>
          ))}
        </select>
        <span
          className="card-list-page-item"
          onClick={() => {
            setPage(lastPage - 1);
            window.scroll({ top: 0 });
          }}
        >
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
        </span>
      </div>
    </div>
  );
};

export default CardListVN;
