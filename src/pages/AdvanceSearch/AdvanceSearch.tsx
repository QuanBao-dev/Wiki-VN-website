import "./AdvanceSearch.css";

import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debounceTime, fromEvent } from "rxjs";
import Encoding from "encoding-japanese";
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
import { parseDescription } from "../../util/parseDescription";

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
  const valueProducerRef = useRef<{ id: number; name: string }[] | []>([]);
  const [isLoading2, setIsLoading2] = useState(
    advanceSearchStore.currentState().search !== search
  );
  const [triggerReset, setTriggerReset] = useState(true);
  const [triggerProducerReset, setTriggerProducerReset] = useState(true);
  const [trigger, setTrigger] = useState(true);
  const selectRef = useRef(document.createElement("select"));
  const inputSearchKeyRef = useRef(document.createElement("input"));
  const buttonSearchRef = useRef(document.createElement("button"));
  const cardListVnContainerRef = useRef(document.createElement("div"));
  const [vnList, setVNList] = useState<VisualNovel[] | []>(
    cachesStore.currentState().caches["dataSearch" + query.page] || []
  );
  const [maxPage, setMaxPage] = useState(
    advanceSearchStore.currentState().maxPage
  );
  const [numberOfColumn, setNumberOfColumn] = useState(4);
  const [tagList, setTagList] = useState<Tag[] | []>(
    cachesStore.currentState().caches["tags"] || []
  );
  const [producerList, setProducerList] = useState<Tag[] | []>(
    cachesStore.currentState().caches["producers"] || []
  );
  const navigate = useNavigate();
  function updateSearchByTag(data: Tag[]) {
    valueRef.current = data;
    setTriggerReset(!triggerReset);
  }
  function updateSearchByProducers(data: Tag[]) {
    valueProducerRef.current = data;
    setTriggerProducerReset(!triggerProducerReset);
  }

  useEffect(() => {
    if (selectRef.current) selectRef.current.value = query.page;
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
  useFetchApi(
    `/api/vndb/producers${
      query.producers ? `?list=${query.producers || ""}&` : "?"
    }isNormal=true`,
    setProducerList,
    "producers",
    [query.producers],
    true,
    true
  );

  useEffect(() => {
    if (
      advanceSearchStore.currentState().search.replace(/page=[0-9]+/g, "") !==
        search.replace(/page=[0-9]+/g, "") ||
      !cachesStore.currentState().caches["dataSearch" + query.page]
    ) {
      setVNList([]);
      setIsLoading2(true);
    } else {
      setVNList(
        cachesStore.currentState().caches["dataSearch" + query.page] || []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page]);

  useEffect(() => {
    updateSearchByTag(tagList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagList]);
  useEffect(() => {
    updateSearchByProducers(producerList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producerList]);

  useFetchApi(
    `/api/vndb?title=${query.textSearch || ""}&page=${query.page}&isCount=${
      advanceSearchStore.currentState().search.replace(/page=[0-9]+/g, "") !==
      search.replace(/page=[0-9]+/g, "")
    }&tags=${query.tags || ""}&producers=${
      query.producers || ""
    }&isContainLastPage=true`,
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
          )}&page=1&tags=${valueRef.current
            .map(({ id }) => id)
            .join(",")}&producers=${valueProducerRef.current
            .map(({ id }) => id)
            .join(",")}`
        );
      }
    );
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputSearchKeyRef.current.value = Encoding.codeToString(
      Encoding.convert(Encoding.urlDecode(decodeURL(query.textSearch)), {
        from: "UTF8",
        to: "UNICODE",
      })
    );
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
        <CustomSelect2
          defaultValue={valueProducerRef.current}
          valueRef={valueProducerRef}
          label={"Search by producers"}
          triggerReset={triggerProducerReset}
          url={"/api/vndb/producers"}
        />
        <button className="search-button-submit" ref={buttonSearchRef}>
          Search
        </button>
      </div>
      {tagList.length > 0 && (
        <div className="description-list">
          <fieldset className="description-item">
            <legend>Tags</legend>
            <ul className="tags-container">
              {tagList.map(({ description, name, id, type, lang, cat }) => {
                return (
                  <TagItem
                    description={description}
                    name={name}
                    type={type}
                    key={id}
                    lang={lang}
                    cat={cat}
                  />
                );
              })}
            </ul>
          </fieldset>
        </div>
      )}
      {producerList.length > 0 && (
        <div className="description-list">
          <fieldset className="description-item">
            <legend>Producers</legend>
            <ul className="tags-container">
              {producerList.map(
                ({ description, name, id, type, lang, cat }) => {
                  return (
                    <TagItem
                      description={description}
                      name={name}
                      type={type}
                      key={id}
                      lang={lang}
                      cat={cat}
                    />
                  );
                }
              )}
            </ul>
          </fieldset>
        </div>
      )}
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
              width={`${100 / numberOfColumn - 2}%`}
              LoadingComponent={undefined}
              margin={3}
            />
          ))}
      </div>

      {maxPage > 1 && (
        <div className="card-list-pages">
          <div
            onClick={() => {
              navigate(
                `/search?textSearch=${
                  query.textSearch || ""
                }&page=${1}&tags=${valueRef.current
                  .map(({ id }) => id)
                  .join(",")}&producers=${valueProducerRef.current
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
                  navigate(
                    `/search?textSearch=${query.textSearch || ""}&page=${
                      v + 1
                    }&tags=${valueRef.current
                      .map(({ id }) => id)
                      .join(",")}&producers=${valueProducerRef.current
                      .map(({ id }) => id)
                      .join(",")}`
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
                  .join(",")}&producers=${valueProducerRef.current
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
              navigate(
                `/search?textSearch=${
                  query.textSearch || ""
                }&page=${maxPage}&tags=${valueRef.current
                  .map(({ id }) => id)
                  .join(",")}&producers=${valueProducerRef.current
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
function TagItem({
  name,
  description,
  type,
  lang,
  cat,
}: {
  type: string;
  name: string;
  description: string;
  lang: string;
  cat: string;
}) {
  const itemRef = useRef(document.createElement("span"));
  useEffect(() => {
    itemRef.current.innerHTML = parseDescription(description);
  }, [description]);
  return (
    <details className="tag-item">
      <summary>{name}</summary>
      <ul>
        <li>
          <span>Description: </span>
          <span ref={itemRef}></span>
        </li>
        {lang && <li>Language: {lang || ""}</li>}
        {cat && (
          <li>
            Category:{" "}
            {cat
              ? cat
                  .replace("cont", "Content")
                  .replace("ero", "Sexual content")
                  .replace("tech", "Technical")
              : ""}
          </li>
        )}
        {type && (
          <li>
            Type:{" "}
            {type
              ? type
                  .replace("co", "Company")
                  .replace("in", "Individual")
                  .replace("ng", "Amateur Group")
              : ""}
          </li>
        )}
      </ul>
    </details>
  );
}
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
