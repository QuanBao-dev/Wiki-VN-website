import "./AdvanceSearch.css";

import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debounceTime, fromEvent } from "rxjs";

import CardItemVN from "../../components/CardItemVN/CardItemVN";
import CustomSelect2 from "../../components/CustomSelect2/CustomSelect2";
import SkeletonLoading from "../../components/SkeletonLoading/SkeletonLoading";
import { Tag } from "../../Interfaces/Tag";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import { advanceSearchStore } from "../../store/advanceSearch";
import cachesStore from "../../store/caches";
import { deleteCachesField } from "../../util/updateCaches";
import { useCardListVNPosition } from "../Hooks/useCardListVN";

const AdvanceSearch = () => {
  const search = useLocation().search;
  const query = useLocation()
    .search.split("&")
    .reduce((ans: any, v) => {
      const [key, value] = v.split("=");
      ans[key.replace("?", "")] = value;
      if (key.replace("?", "") === "page")
        ans[key.replace("?", "")] = parseInt(value);
      return ans;
    }, {});
  if (!query.page) query.page = 1;
  const valueRef = useRef<{ id: number; name: string }[] | []>([]);
  const [isLoading2, setIsLoading2] = useState(
    advanceSearchStore.currentState().search !== search
  );
  const [triggerReset, setTriggerReset] = useState(true);
  const [trigger, setTrigger] = useState(true);
  const selectRef = useRef(document.createElement("select"));
  const inputSearchKeyRef = useRef(document.createElement("input"));
  const buttonSearchRef = useRef(document.createElement("button"));
  const cardListVnContainerRef = useRef(document.createElement("div"));
  const [vnList, setVNList] = useState<VisualNovel[] | []>(
    cachesStore.currentState().caches["dataSearch" + query.page] || []
  );
  const [maxPage, setMaxPage] = useState(
    advanceSearchStore.currentState().search.replace(/page=[0-9]+/g, "") ===
      search.replace(/page=[0-9]+/g, "")
      ? advanceSearchStore.currentState().maxPage
      : 1
  );
  const [numberOfColumn, setNumberOfColumn] = useState(4);
  const [tagList, setTagList] = useState<Tag[] | []>(
    cachesStore.currentState().caches["tags"] || []
  );
  const navigate = useNavigate();
  function updateSearchByTag(data: Tag[]) {
    valueRef.current = data;
    setTriggerReset(!triggerReset);
  }

  useEffect(() => {
    selectRef.current.value = query.page;
    advanceSearchStore.updateState({
      search,
      maxPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, maxPage]);
  useFetchApi(
    `/api/vndb/tags${
      query.tags ? `?list=${query.tags || ""}&` : "?"
    }isNormal=true`,
    setTagList,
    "tags",
    [query.tags],
    true,
    true
  );

  useEffect(() => {
    updateSearchByTag(tagList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagList]);
  useFetchApi(
    `/api/vndb?title=${query.textSearch || ""}&page=${query.page}&isCount=${
      advanceSearchStore.currentState().search.replace(/page=[0-9]+/g, "") !==
      search.replace(/page=[0-9]+/g, "")
    }&tags=${query.tags || ""}&isContainLastPage=true`,
    setVNList,
    "dataSearch" + query.page,
    [search],
    true,
    advanceSearchStore.currentState().search.replace(/page=[0-9]+/g, "") !==
      search.replace(/page=[0-9]+/g, "") ||
      !cachesStore.currentState().caches["dataSearch" + query.page],
    setIsLoading2,
    undefined,
    undefined,
    setMaxPage
  );
  useEffect(() => {
    const subscription = fromEvent(buttonSearchRef.current, "click").subscribe(
      () => {
        deleteCachesField("dataSearch");
        navigate(
          `/search?textSearch=${encodeURL(
            inputSearchKeyRef.current.value || ""
          )}&tags=${valueRef.current.map(({ id }) => id).join(",")}`
        );
      }
    );
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputSearchKeyRef.current.value = decodeURL(query.textSearch);
  }, [query.textSearch]);
  useEffect(() => {
    if (window.innerWidth > 1200) {
      setNumberOfColumn(4);
    }
    if (window.innerWidth > 700 && window.innerWidth <= 1200) {
      setNumberOfColumn(3);
    }
    if (window.innerWidth <= 700) {
      setNumberOfColumn(2);
    }
  }, []);
  console.log(numberOfColumn)
  useEffect(() => {
    const subscription = fromEvent(window, "resize")
      .pipe(debounceTime(500))
      .subscribe(() => {
        if (window.innerWidth > 1200) {
          setNumberOfColumn(4);
          setTrigger(!trigger);
          return;
        }
        if (window.innerWidth > 700 && window.innerWidth <= 1200) {
          setNumberOfColumn(3);
          setTrigger(!trigger);
          return;
        }

        if (window.innerWidth <= 700) {
          setNumberOfColumn(2);
          setTrigger(!trigger);
          return;
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [trigger]);
  useCardListVNPosition(
    cardListVnContainerRef,
    vnList,
    trigger,
    query.page,
    0,
    numberOfColumn
  );
  return (
    <div className="advance-search-container">
      <div className="advance-search-wrapper">
        <fieldset className="search-key-field">
          <legend className="label-select2">Search by key</legend>
          <div className="input-section-container">
            <input
              type="text"
              placeholder="Search by key"
              ref={inputSearchKeyRef}
              defaultValue={decodeURL(query.textSearch)}
            />
          </div>
        </fieldset>
        <CustomSelect2
          defaultValue={valueRef.current}
          valueRef={valueRef}
          label={"Search by tags"}
          triggerReset={triggerReset}
          url={"/api/vndb/tags"}
        />
        <button className="search-button-submit" ref={buttonSearchRef}>
          Search
        </button>
      </div>
      <div className="card-list-vn" ref={cardListVnContainerRef}>
        {!isLoading2 &&
          vnList &&
          vnList.map(
            ({ title, description, image, id, image_nsfw, screens }) => (
              <Suspense
                key={id}
                fallback={
                  <SkeletonLoading
                    isLoading={true}
                    height={300}
                    width={100}
                    LoadingComponent={undefined}
                    margin={3}
                  />
                }
              >
                <CardItemVN
                  key={id}
                  title={title}
                  description={description}
                  image={image}
                  id={id}
                  isNsfw={image_nsfw}
                  screens={screens}
                  setTrigger={setTrigger}
                  isNormal={true}
                  trigger={trigger}
                />
              </Suspense>
            )
          )}
        {isLoading2 &&
          Array.from(Array(10).keys()).map((key) => (
            <SkeletonLoading
              key={key}
              isLoading={true}
              height={300}
              width={`${100 / numberOfColumn - 1}%`}
              LoadingComponent={undefined}
              margin={3}
            />
          ))}
      </div>
      {maxPage > 1 && (
        <div className="card-list-pages">
          <div
            onClick={() => {
              if (
                advanceSearchStore
                  .currentState()
                  .search.replace(/page=[0-9]+/g, "") !==
                  search.replace(/page=[0-9]+/g, "") ||
                !cachesStore.currentState().caches["dataSearch" + query.page]
              ) {
                setVNList([]);
                setIsLoading2(true);
              } else {
                setVNList(
                  cachesStore.currentState().caches["dataSearch" + 1] || []
                );
              }
              navigate(
                `/search?textSearch=${
                  query.textSearch || ""
                }&page=${1}&tags=${valueRef.current
                  .map(({ id }) => id)
                  .join(",")}`
              );
              window.scroll({ top: 0 });
            }}
          >
            <i className="fas fa-chevron-left"></i>
            <i className="fas fa-chevron-left"></i>
          </div>
          {Array.from(Array(maxPage + 1).keys())
            .slice(
              query.page - 7 > 0 ? query.page - 7 : 0,
              query.page + 7 < maxPage ? query.page + 7 : maxPage
            )
            .map((v, index) => (
              <div
                className={query.page === v + 1 ? "active" : ""}
                key={index}
                onClick={() => {
                  if (
                    advanceSearchStore
                      .currentState()
                      .search.replace(/page=[0-9]+/g, "") !==
                      search.replace(/page=[0-9]+/g, "") ||
                    !cachesStore.currentState().caches[
                      "dataSearch" + query.page
                    ]
                  ) {
                    setVNList([]);
                    setIsLoading2(true);
                  } else {
                    setVNList(
                      cachesStore.currentState().caches[
                        "dataSearch" + (v + 1)
                      ] || []
                    );
                  }
                  navigate(
                    `/search?textSearch=${query.textSearch || ""}&page=${
                      v + 1
                    }&tags=${valueRef.current.map(({ id }) => id).join(",")}`
                  );
                  window.scroll({
                    top: 0,
                  });
                }}
              >
                {v + 1}
              </div>
            ))}
          <select
            ref={selectRef}
            onChange={(e) => {
              if (
                advanceSearchStore
                  .currentState()
                  .search.replace(/page=[0-9]+/g, "") !==
                  search.replace(/page=[0-9]+/g, "") ||
                !cachesStore.currentState().caches["dataSearch" + query.page]
              ) {
                setVNList([]);
                setIsLoading2(true);
              } else {
                setVNList(
                  cachesStore.currentState().caches[
                    "dataSearch" + e.target.value
                  ] || []
                );
              }
              navigate(
                `/search?textSearch=${query.textSearch || ""}&page=${+e.target
                  .value}&tags=${valueRef.current
                  .map(({ id }) => id)
                  .join(",")}`
              );
              window.scroll({ top: 0 });
            }}
          >
            {Array.from(Array(maxPage).keys()).map((number, key) => (
              <option key={key}>{number + 1}</option>
            ))}
          </select>
          <div
            onClick={() => {
              if (
                advanceSearchStore
                  .currentState()
                  .search.replace(/page=[0-9]+/g, "") !==
                  search.replace(/page=[0-9]+/g, "") ||
                !cachesStore.currentState().caches["dataSearch" + query.page]
              ) {
                setVNList([]);
                setIsLoading2(true);
              } else {
                setVNList(
                  cachesStore.currentState().caches["dataSearch" + maxPage] ||
                    []
                );
              }
              navigate(
                `/search?textSearch=${
                  query.textSearch || ""
                }&page=${maxPage}&tags=${valueRef.current
                  .map(({ id }) => id)
                  .join(",")}`
              );
              window.scroll({ top: 0 });
            }}
          >
            <i className="fas fa-chevron-right"></i>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      )}
    </div>
  );
};

function encodeURL(str: string) {
  if (!str) return "";
  return str
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/ /g, "%20");
}
function decodeURL(str: string) {
  if (!str) return "";
  return str
    .replace(/%21/g, "!")
    .replace(/%27/g, "'")
    .replace(/%28/g, "\\(")
    .replace(/%29/g, "\\)")
    .replace(/%2A/g, "\\*")
    .replace(/%20/g, " ");
}

export default AdvanceSearch;
