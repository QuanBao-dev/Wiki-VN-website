/* eslint-disable react/jsx-no-target-blank */
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
import Gif from "../../components/Gif/Gif";
import { useInitStore } from "../Hooks/useInitStore";
import { interval, takeWhile } from "rxjs";
import tags from "../../data/tags.json";
import Characters from "../../components/Characters/Characters";
import { LazyLoadImage } from "react-lazy-load-image-component";
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
  orig: "Original game",
  seq: "Sequel",
  side: "Side story",
  set: "Same setting",
  ser: "Same serries",
};
const Detail = () => {
  const { id } = useParams();
  const [filterMode, setFilterMode] = useState(
    userStore.currentState().isFilterNsfw ? 0 : 1
  );
  const [isShowExplicitImage, setIsShowExplicitImage] = useState(false);
  const [trigger, setTrigger] = useState(true);
  const [url, setUrl] = useState("");
  const [isHide, setIsHide] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorPatch, setErrorPatch] = useState("");
  let [detailState, setDetailState] = useState(
    (cachesStore.currentState().caches.VNs &&
    cachesStore.currentState().caches.VNs[id as string]
      ? cachesStore.currentState().caches.VNs[id as string]
      : {}) as VisualNovel
  );
  const [relations, setRelations] = useState([]);
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
  const [cachesState, setCachesState] = useState(cachesStore.currentState());
  const backupObj = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const timeoutRef = useRef<any>();
  useEffect(() => {
    document.title = detailState.title || "Sugoi Visual Novel | SVN";
    return () => {
      document.title = "Sugoi Visual Novel | SVN";
    };
  }, [detailState]);
  useInitStore(cachesStore, setCachesState);
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
    "/api/vndb/" + id + "/relations",
    setRelations,
    "relations",
    [id],
    false,
    true
  );
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
    (error: any) => {
      if (error.message === "Not a member") {
        setErrorPatch("Early access patch");
        setPatch(error);
      } else {
        setPatch({} as Patch);
      }
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

  detailState.relations = relations;
  if (detailState.relations) {
    relationsData = relations.reduce((ans: any, relation: any) => {
      if (!ans[relation.relation]) ans[relation.relation] = [];
      ans[relation.relation].push(relation);
      return ans;
    }, {});
  }
  return (
    <div className="app-wrapper">
      {!errorPatch && (
        <Popup
          title={"Thank you!"}
          description={
            "If you like these free translation patches on this website and want to say thanks, or encourage me to do more, you can consider buying me a coffee!"
          }
          url={url}
          isHide={isHide}
          setIsHide={setIsHide}
        />
      )}
      {errorPatch && (
        <Popup
          title={"Early Access!"}
          description={
            "This is the early access patch of this game. You can access this after you logged in with a member account or a supporter account."
          }
          url={url}
          isHide={isHide}
          setIsHide={setIsHide}
        />
      )}

      <div className="black-background" ref={blackBackgroundRef}></div>
      <div
        className="image-zoom-container"
        ref={imageZoomContainerRef}
        onClick={() => {
          document.body.style.overflow = "auto";

          clearTimeout(timeoutRef.current);
          imageZoomContainerRef.current.style.top = backupObj.current.y + "px";
          imageZoomContainerRef.current.style.left = backupObj.current.x + "px";
          imageZoomContainerRef.current.style.width =
            backupObj.current.width + "px";
          imageZoomContainerRef.current.style.height =
            backupObj.current.height + "px";
          timeoutRef.current = setTimeout(() => {
            chosenImageRef.current.style.opacity = "1";
            imageZoomContainerRef.current.style.display = "none";
            blackBackgroundRef.current.style.display = "none";
            (imageZoomContainerRef.current.querySelector("img") as any).src =
              "";
          }, 500);
        }}
      >
        <img src="" alt="" />
      </div>
      <div className="visual-novel-detail-container">
        <h1 className="visual-novel-title">{detailState.title}</h1>
        <div className="detail-title-container">
          <div className="image-wrapper">
            <LazyLoadImage
              effect="opacity"
              className={
                detailState.image_nsfw &&
                !isShowExplicitImage &&
                userStore.currentState().isFilterNsfw
                  ? "nsfw"
                  : ""
              }
              src={detailState.image}
              alt=""
            />
            {!isShowExplicitImage &&
              detailState.image_nsfw &&
              userStore.currentState().isFilterNsfw && (
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
                {detailState.aliases && detailState.aliases.length > 0 && (
                  <tr>
                    <th>Aliases</th>
                    <td>
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyleType: "none",
                        }}
                      >
                        {typeof detailState.aliases !== "string"
                          ? detailState.aliases.map((v, index) => (
                              <li key={index}>{v}</li>
                            ))
                          : detailState.aliases}
                      </ul>
                    </td>
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
                <tr>
                  <th>VNDB</th>
                  <td>
                    <a
                      href={`https://vndb.org/v${id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link{" "}
                      <i
                        className="fas fa-external-link-alt"
                        style={{
                          fontSize: "0.8rem",
                        }}
                      ></i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
        </div>
        {detailState.tags &&
          detailState.tags.filter((tag) => tag.category !== "ero").length >
            0 && (
            <fieldset className="detail-tag-list">
              <legend>Tags</legend>
              <div>
                {detailState.tags
                  .filter((tag) => tag.category !== "ero")
                  .filter((v) => v.rating >= 1.5 || (v as any)[1] >= 1.5)
                  .sort((a, b) => {
                    if ((a as any).length) {
                      return -(a as any)[1] + (b as any)[1];
                    }
                    return undefined;
                  })
                  .map((tag: any) => {
                    if (tag.length) {
                      const tagId = tag[0];
                      const rating = tag[1];
                      const tagName = tags.find(
                        (tag) => tag.id === tagId
                      )?.name;
                      if (!tagName) return undefined;
                      return (
                        <Link
                          key={tagId}
                          to={`/search?textSearch=&page=1&tags=${tagId}&producers=`}
                        >
                          <span
                            style={{
                              fontSize: `${rating / 3.2}rem`,
                            }}
                          >
                            {tagName} ({rating})
                          </span>
                        </Link>
                      );
                    }
                    return (
                      <Link
                        key={tag.id}
                        to={`/search?textSearch=&page=1&tags=${tag.id.replace(
                          "g",
                          ""
                        )}&producers=`}
                      >
                        <span
                          style={{
                            fontSize: `${tag.rating / 3.2}rem`,
                          }}
                        >
                          {tag.name} ({tag.rating})
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </fieldset>
          )}
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
                  <LazyLoadImage
                    effect="opacity"
                    key={key}
                    src={screen.image.replace("sf", "st")}
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
                      // console.log(screen.image);
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
                  />
                ))}
            </div>
          </fieldset>
        )}
        {patch.affiliateLinks &&
          patch.affiliateLinks.filter(
            (data) => data.label.toLowerCase() === "dlsite"
          ).length > 0 && (
            <fieldset>
              <legend>Shop</legend>
              {patch.affiliateLinks
                .filter((data) => data.label.toLowerCase() === "dlsite")
                .map((data, key) => (
                  <a
                    key={key}
                    rel="noopener sponsored"
                    href={data.url}
                    target="_blank"
                    className="affiliate-link-item target_type"
                  >
                    {detailState.screens && detailState.screens.length <= 1 && (
                      <img
                        src={
                          !detailState.image_nsfw ||
                          !userStore.currentState().isFilterNsfw
                            ? detailState.image
                            : detailState.screens &&
                              detailState.screens.filter(({ nsfw }) => !nsfw)[0]
                            ? detailState.screens
                                .filter(({ nsfw }) => !nsfw)[0]
                                .image.replace(/sf/g, "st")
                            : isShowExplicitImage
                            ? detailState.image
                            : "/background.jpg"
                        }
                        alt={""}
                      ></img>
                    )}
                    {detailState.screens && detailState.screens.length > 1 && (
                      <Gif
                        screens={detailState.screens}
                        isNsfw={filterMode > 0}
                      />
                    )}
                    <label htmlFor="">{data.label}</label>
                  </a>
                ))}
            </fieldset>
          )}
        {patch && patch.linkDownloads && patch.linkDownloads.length > 0 && (
          <fieldset className="release-container">
            {userStore.currentState().role === "Admin" && (
              <DeletePatch
                vnId={parseInt(id || "0")}
                setTrigger={setTrigger}
                trigger={trigger}
              />
            )}
            <LegendClock patch={patch} />
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
                );
              })}
            </ul>
          </fieldset>
        )}
        {patch && patch.linkDownloads && patch.linkDownloads.length > 0 && (
          <fieldset>
            <legend>Guide to apply the patch</legend>
            <ol>
              <li>Install the game. (if required)</li>
              <li>Download the patch.</li>
              <li>
                Extract the patch. (if the patch is in .rar or .zip format)
              </li>
              <li>
                Follow all the steps in the GUIDE.txt file (If there's one after
                extraction)
              </li>
              <li>
                Put all files and folders into the game folder and overwrite the
                destination to apply.
              </li>
            </ol>
          </fieldset>
        )}
        {detailState.id && isLoading === false && (
          <Votes vnId={detailState.id} dataVN={detailState} />
        )}
        {userStore.currentState().role === "Admin" && (
          <Suspense
            fallback={
              <div>
                <i
                  className="fas fa-spinner fa-pulse fa-5x"
                  style={{
                    display: "inline-block",
                    margin: "auto",
                  }}
                ></i>
              </div>
            }
          >
            <FormUpdatePatch
              dataVN={detailState}
              setTrigger={setTrigger}
              trigger={trigger}
            />
          </Suspense>
        )}
        {userStore.currentState().role === "Admin" && (
          <Suspense
            fallback={
              <div>
                <i
                  className="fas fa-spinner fa-pulse fa-5x"
                  style={{
                    display: "inline-block",
                    margin: "auto",
                  }}
                ></i>
              </div>
            }
          >
            <FormUpdateTranslatable dataVN={detailState} />
          </Suspense>
        )}
        {cachesState.caches["patches"] && (
          <Suspense
            fallback={
              <div>
                <i
                  className="fas fa-spinner fa-pulse fa-5x"
                  style={{
                    display: "inline-block",
                    margin: "auto",
                  }}
                ></i>
              </div>
            }
          >
            <VoterList id={id} />
          </Suspense>
        )}
        <Characters vnId={id as string} />
      </div>
    </div>
  );
};

function LegendClock({ patch }: { patch: Patch }) {
  const [remainingTime, setRemainingTime] = useState("00:00:00:00");
  useEffect(() => {
    const subscription = interval(1000)
      .pipe(takeWhile(() => userStore.currentState().role === "Admin"))
      .subscribe(() => {
        setRemainingTime(
          convertToClockTime(
            (new Date(patch.publishDate).getTime() - Date.now() - 1000) / 1000
          )
        );
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [patch.publishDate, patch.vnId]);
  return (
    <legend>
      {patch.isMemberOnly ? "Early Access " : ""} Releases
      {userStore.currentState().role === "Admin" &&
      patch.isMemberOnly &&
      patch.publishDate
        ? ` (${remainingTime})`
        : ""}
    </legend>
  );
}

function convertToClockTime(time: number) {
  const days = parseInt((time / 86400).toString());
  const hours = parseInt(((time - days * 86400) / 3600).toString());
  const minutes = parseInt(
    ((time - days * 86400 - hours * 3600) / 60).toString()
  );
  const seconds = parseInt(
    (time - days * 86400 - hours * 3600 - minutes * 60).toString()
  );
  return `${days > 9 ? "" : "0"}${days}:${hours > 9 ? "" : "0"}${hours}:${
    minutes > 9 ? "" : "0"
  }${minutes}:${seconds > 9 ? "" : "0"}${seconds}`;
}
export default Detail;
