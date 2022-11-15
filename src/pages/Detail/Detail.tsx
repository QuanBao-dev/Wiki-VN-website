import "./Detail.css";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Patch } from "../../Interfaces/patch";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import cachesStore from "../../store/caches";
import { parseDescription } from "../../util/parseDescription";
import { useFetchApi } from "../Hooks/useFetchApi";
import Votes from "../../components/Votes/Votes";
import { userStore } from "../../store/user";
import Popup from "../../components/Popup/Popup";

const VoterList = React.lazy(
  () => import("../../components/VoterList/VoterList")
);

const DeletePatch = React.lazy(
  () => import("../../components/DeletePatch/DeletePatch")
);
const FormUpdatePatch = React.lazy(
  () => import("../../components/FormUpdatePatch/FormUpdatePatch")
);
const FormUpdateTranslatable = React.lazy(
  () => import("../../components/FormUpdateTranslatable/FormUpdateTranslatable")
);
const convertObject = {
  char: "Shares characters",
  alt: "Alternative version",
  fan: "Fandisc",
  preq: "Prequel",
  side: "Side story",
  set: "Same setting",
  ser: "Same serries",
};
const Detail = () => {
  const { id } = useParams();
  const [filterMode, setFilterMode] = useState(0);
  const [isShowExplicitImage, setIsShowExplicitImage] = useState(false);
  const [trigger, setTrigger] = useState(true);
  const [url, setUrl] = useState("");
  const [isHide, setIsHide] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  let [detailState, setDetailState] = useState(
    (cachesStore.currentState().caches.VNs &&
    cachesStore.currentState().caches.VNs[id as string]
      ? cachesStore.currentState().caches.VNs[id as string]
      : {}) as VisualNovel
  );
  const [patch, setPatch] = useState<Patch>(
    (cachesStore.currentState().caches.patches &&
    cachesStore.currentState().caches.patches[id as string]
      ? cachesStore.currentState().caches.patches[id as string]
      : {}) as Patch
  );
  const descriptionRef = useRef(document.createElement("div"));
  const imageZoomContainerRef = useRef(document.createElement("div"));
  const blackBackgroundRef = useRef(document.createElement("div"));
  const chosenImageRef = useRef(document.createElement("img"));
  const backupObj = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const timeoutRef = useRef<any>();
  useEffect(() => {
    setDetailState(
      (cachesStore.currentState().caches.VNs
        ? cachesStore.currentState().caches.VNs[id as string]
        : {
            image: "",
            title: "",
            aliases: "",
            length: "",
            description: "",
            rating: "",
            relations: "",
            original: "",
          }) as VisualNovel
    );
  }, [id]);
  useFetchApi(
    "/api/vndb/" + id,
    setDetailState,
    "VNs",
    [id],
    true,
    cachesStore.currentState().caches.VNs &&
      !cachesStore.currentState().caches.VNs[id as any]
  );
  useFetchApi(
    "/api/patch/" + id,
    setPatch,
    "patches",
    [id, trigger],
    true,
    true,
    setIsLoading,
    () => {
      setPatch({} as Patch);
    }
  );
  let relationsData = {};
  if (!detailState) detailState = {} as any;
  useEffect(() => {
    descriptionRef.current.innerHTML = parseDescription(
      detailState.description
    );
    window.scroll({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailState.description]);

  if (detailState.relations)
    relationsData = (detailState.relations as any).reduce(
      (ans: any, relation: any) => {
        if (!ans[relation.relation]) ans[relation.relation] = [];
        ans[relation.relation].push(relation);
        return ans;
      },
      {}
    );
  return (
    <div className="app-wrapper">
      <Popup
        title={"Thank you!"}
        description={
          "If you like these free translation patches on this website and want to say thanks, or encourage me to do more, you can consider buying me a coffee!"
        }
        url={url}
        isHide={isHide}
        setIsHide={setIsHide}
      />

      <div className="black-background" ref={blackBackgroundRef}></div>
      <div
        className="image-zoom-container"
        ref={imageZoomContainerRef}
        onClick={() => {
          clearTimeout(timeoutRef.current);
          imageZoomContainerRef.current.style.top = backupObj.current.y + "px";
          imageZoomContainerRef.current.style.left = backupObj.current.x + "px";
          imageZoomContainerRef.current.style.width =
            backupObj.current.width + "px";
          imageZoomContainerRef.current.style.height =
            backupObj.current.height + "px";
          document.body.style.overflow = "auto";
          timeoutRef.current = setTimeout(() => {
            chosenImageRef.current.style.opacity = "1";
            imageZoomContainerRef.current.style.display = "none";
            blackBackgroundRef.current.style.display = "none";
          }, 500);
        }}
      >
        <img src="" alt="" />
      </div>
      <div className="visual-novel-detail-container">
        <h1 className="visual-novel-title">{detailState.title}</h1>
        <div className="detail-title-container">
          <div className="image-wrapper">
            <img
              className={
                detailState.image_nsfw && !isShowExplicitImage ? "nsfw" : ""
              }
              src={detailState.image}
              alt=""
            ></img>
            {!isShowExplicitImage && detailState.image_nsfw && (
              <div className="block-overlay">
                <div>NSFW Image (18+)</div>
                <div
                  className="show-me-button"
                  onClick={() => setIsShowExplicitImage(!isShowExplicitImage)}
                >
                  Show me anyway
                </div>
              </div>
            )}
          </div>
          <fieldset className="detail-title-table-info-container">
            <legend>Information</legend>
            <table className="detail-title-table-info">
              <thead>
                <tr>
                  {detailState.original && <th>Original</th>}
                  {detailState.original && <td>{detailState.original}</td>}
                </tr>
              </thead>
              <tbody>
                {detailState.aliases && (
                  <tr>
                    <th>Aliases</th>
                    <td>{detailState.aliases}</td>
                  </tr>
                )}
                {detailState.length && (
                  <tr>
                    <th>Length</th>
                    <td>{detailState.length}</td>
                  </tr>
                )}
                {Object.keys(relationsData).length > 0 && (
                  <tr>
                    <th>Relations</th>
                    <td>
                      {Object.keys(relationsData).map((keyName, key) => (
                        <div key={key}>
                          <div style={{ fontWeight: "600" }}>
                            {(convertObject as any)[keyName]}
                          </div>
                          <ul className="detail-relation-list">
                            {(relationsData as any)[keyName].map(
                              (relation: any, key: number) => (
                                <li key={key}>
                                  <Link to={"/vns/" + relation.id}>
                                    {relation.title}
                                  </Link>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
                <tr>
                  <th>Rating</th>
                  <td>{detailState.rating}</td>
                </tr>
              </tbody>
            </table>
          </fieldset>
        </div>
        <fieldset className="description-container">
          <legend>Description</legend>
          <div ref={descriptionRef}></div>
        </fieldset>
        {detailState.screens && detailState.screens.length > 0 && (
          <fieldset>
            <legend>Screenshots</legend>
            {detailState.screens.filter(({ nsfw }) => nsfw).length > 0 && (
              <div className="mode-filter-screenshots">
                <div
                  className={filterMode === 0 ? "active" : ""}
                  onClick={() => setFilterMode(0)}
                >
                  Safe ({detailState.screens.filter(({ nsfw }) => !nsfw).length}
                  )
                </div>
                <div
                  className={filterMode === 1 ? "active" : ""}
                  onClick={() => setFilterMode(1)}
                >
                  Explicit (
                  {detailState.screens.filter(({ nsfw }) => nsfw).length})
                </div>
              </div>
            )}
            <div className="screenshots-container">
              {detailState.screens
                .filter(({ nsfw }) => (filterMode === 0 ? !nsfw : true))
                .map((screen, key) => (
                  <img
                    key={key}
                    src={screen.image}
                    alt=""
                    className={screen.nsfw ? "nsfw" : ""}
                    onClick={(e) => {
                      clearTimeout(timeoutRef.current);
                      const element = e.target as HTMLImageElement;
                      chosenImageRef.current = element;
                      const { y, x } = element.getBoundingClientRect();
                      imageZoomContainerRef.current.style.display = "block";
                      imageZoomContainerRef.current.style.transition = "0s";
                      imageZoomContainerRef.current.style.zIndex = "1000";
                      blackBackgroundRef.current.style.zIndex = "999";
                      imageZoomContainerRef.current.style.left = `${x}px`;
                      imageZoomContainerRef.current.style.top = `${y}px`;
                      imageZoomContainerRef.current.style.width = `${element.offsetWidth}px`;
                      imageZoomContainerRef.current.style.height = `${element.offsetHeight}px`;
                      (
                        imageZoomContainerRef.current.querySelector(
                          "img"
                        ) as any
                      ).src = screen.image;
                      chosenImageRef.current.style.opacity = "0";
                      timeoutRef.current = setTimeout(() => {
                        document.body.style.overflow = "hidden";
                        imageZoomContainerRef.current.style.transition = "0.4s";
                        if (
                          screen.width < window.innerWidth &&
                          screen.height < window.innerHeight
                        ) {
                          imageZoomContainerRef.current.style.width = `${screen.width}px`;
                          imageZoomContainerRef.current.style.height = `${screen.height}px`;
                          imageZoomContainerRef.current.style.top = `${
                            window.innerHeight / 2 - screen.height / 2
                          }px`;
                          imageZoomContainerRef.current.style.left = `${
                            window.innerWidth / 2 - screen.width / 2
                          }px`;
                        } else {
                          if (
                            window.innerWidth <= screen.width &&
                            window.innerWidth *
                              (screen.height / screen.width) <=
                              window.innerHeight
                          ) {
                            imageZoomContainerRef.current.style.width = `${window.innerWidth}px`;
                            imageZoomContainerRef.current.style.height = `${
                              window.innerWidth * (screen.height / screen.width)
                            }px`;
                            imageZoomContainerRef.current.style.top = `${
                              window.innerHeight / 2 -
                              (window.innerWidth *
                                (screen.height / screen.width)) /
                                2
                            }px`;
                            imageZoomContainerRef.current.style.left = `${0}px`;
                          }
                          if (
                            window.innerHeight <= screen.height &&
                            window.innerHeight *
                              (screen.width / screen.height) <=
                              window.innerWidth
                          ) {
                            imageZoomContainerRef.current.style.width = `${
                              window.innerHeight *
                              (screen.width / screen.height)
                            }px`;
                            imageZoomContainerRef.current.style.height = `${window.innerHeight}px`;
                            imageZoomContainerRef.current.style.top = `${0}px`;
                            imageZoomContainerRef.current.style.left = `${
                              window.innerWidth / 2 -
                              (window.innerHeight *
                                (screen.width / screen.height)) /
                                2
                            }px`;
                          }
                        }
                        backupObj.current = {
                          x,
                          y,
                          width: element.offsetWidth,
                          height: element.offsetHeight,
                        };
                        blackBackgroundRef.current.style.display = "block";
                      }, 100);
                    }}
                  ></img>
                ))}
            </div>
          </fieldset>
        )}
        {patch && patch.linkDownloads && (
          <fieldset className="release-container">
            {userStore.currentState().role === "Admin" && (
              <DeletePatch
                vnId={parseInt(id || "0")}
                setTrigger={setTrigger}
                trigger={trigger}
              />
            )}
            <legend>Releases</legend>
            <ul className="release-list">
              {patch.linkDownloads.map(({ label, url }, key) => {
                return (
                  <div
                    onClick={() => {
                      setIsHide(false);
                      setUrl(url);
                    }}
                    key={key}
                    className="button-download"
                  >
                    <li>{label}</li>
                  </div>
                  // <a
                  //   className="button-download"
                  //   key={key}
                  //   href={url}
                  //   target={"_blank"}
                  //   rel="noreferrer"
                  // >
                  //   {label}
                  // </a>
                );
              })}
            </ul>
          </fieldset>
        )}
        {detailState.id && isLoading === false && (
          <Votes vnId={detailState.id} dataVN={detailState} />
        )}
        {userStore.currentState().role === "Admin" && (
          <Suspense fallback={<div>Loading...</div>}>
            <FormUpdatePatch
              dataVN={detailState}
              setTrigger={setTrigger}
              trigger={trigger}
            />
          </Suspense>
        )}
        {userStore.currentState().role === "Admin" && (
          <Suspense fallback={<div>Loading...</div>}>
            <FormUpdateTranslatable dataVN={detailState} />
          </Suspense>
        )}
        {userStore.currentState().role === "Admin" && (
          <Suspense fallback={<div>Loading...</div>}>
            <VoterList id={id} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Detail;
