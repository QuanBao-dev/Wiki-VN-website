import "./CustomSelect2.css";

import { useEffect, useRef, useState } from "react";
import { fromEvent, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { catchError, debounceTime, filter, pluck } from "rxjs/operators";

import { Tag } from "../../Interfaces/Tag";
interface Props {
  valueRef: any;
  label: any;
  triggerReset: any;
  defaultValue: any;
  url: string;
}
const CustomSelect2 = ({
  valueRef,
  label,
  triggerReset,
  defaultValue,
  url,
}: Props) => {
  const customSelectContainerRef = useRef(document.createElement("fieldset"));
  const listSuggestionRef = useRef(document.createElement("ul"));
  const isDoneFetchingRef = useRef(false);
  const inputRef = useRef(document.createElement("input"));
  const [allSelectedOptions, setAllSelectedOptions] = useState<Tag[] | []>([]);
  const [maxPage, setMaxPage] = useState(10);
  const [page, setPage] = useState(1);
  const [dataSuggestions, setDataSuggestions] = useState<Tag[] | []>([]);
  const [textSearch, setTextSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const pageRef = useRef(0);
  const textSearchRef = useRef("");
  useEffect(() => {
    valueRef.current = defaultValue;
    setAllSelectedOptions(defaultValue);
    inputRef.current.value = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerReset]);
  useEffect(() => {
    if (!defaultValue) return;
    setAllSelectedOptions(defaultValue);
  }, [defaultValue]);
  useEffect(() => {
    if (!url) {
      setActiveIndex(0);
      setDataSuggestions(
        allSelectedOptions.filter((data) =>
          data.name.match(new RegExp(textSearch, "i"))
        )
      );
      return;
    }
    isDoneFetchingRef.current = false;
    const subscription = ajax(
      url + `?page=${page}` + (textSearch !== "" ? `&q=${textSearch}` : "")
    )
      .pipe(
        pluck("response", "message"),
        catchError((error) => of({ error }))
      )
      .subscribe((data: any) => {
        isDoneFetchingRef.current = true;
        if (data.error) return;
        setMaxPage(data.last_visible_page);

        if (textSearchRef.current !== textSearch) {
          setDataSuggestions([...data.data]);
          setPage(1);
          setActiveIndex(0);
        }

        if (pageRef.current !== page) {
          setDataSuggestions([...dataSuggestions, ...data.data]);
        }

        pageRef.current = page;
        textSearchRef.current = textSearch;
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textSearch, page, url, triggerFetch]);

  useEffect(() => {
    if (!url) return;
    const subscription = fromEvent(listSuggestionRef.current, "scroll")
      .pipe(
        filter(
          () =>
            listSuggestionRef.current.scrollHeight -
              listSuggestionRef.current.scrollTop <=
              200 && isDoneFetchingRef.current === true
        ),
        debounceTime(300)
      )
      .subscribe(() => {
        if (maxPage >= page + 1 && listSuggestionRef.current.scrollHeight)
          setPage(page + 1);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [maxPage, page, url]);

  useEffect(() => {
    const subscription = fromEvent(inputRef.current, "focus").subscribe(() => {
      listSuggestionRef.current.style.display = "block";
      setTriggerFetch(!triggerFetch);
    });

    const subscription2 = fromEvent(window, "click").subscribe((e: any) => {
      if (customSelectContainerRef.current.contains(e.target)) return;
      listSuggestionRef.current.scroll({
        top: 0,
      });
      listSuggestionRef.current.style.display = "none";
    });

    const subscription3 = fromEvent(inputRef.current, "input")
      .pipe(debounceTime(500))
      .subscribe((e: any) => {
        listSuggestionRef.current.style.display = "block";
        setTextSearch(e.target.value);
      });
    return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  valueRef.current = allSelectedOptions;
  return (
    <fieldset
      className="custom-select2-container"
      ref={customSelectContainerRef}
    >
      <legend className="label-select2">{label}</legend>
      <div className="custom-select2-wrapper">
        <div
          className="input-section-container"
          onClick={() => {
            inputRef.current.focus();
          }}
        >
          {allSelectedOptions.length > 0 && (
            <div
              className="all-options-selected"
              onClick={() => {
                inputRef.current.focus();
              }}
            >
              {allSelectedOptions.map((data, index) => (
                <span
                  key={index}
                  onClick={() => {
                    setAllSelectedOptions(
                      allSelectedOptions.filter(({ id }) => id !== data.id)
                    );
                  }}
                >
                  <div className="one"></div>
                  <div className="two"></div>
                  {data.name}
                </span>
              ))}
            </div>
          )}
          <input
            placeholder="Click to add tags"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputRef.current.value = "";
                // if (listSuggestionRef.current.style.display === "none") {
                //   const searchButton = document.querySelector(
                //     ".button-filter-anime"
                //   ) as any;
                //   searchButton.dispatchEvent(new CustomEvent("click"));
                //   return;
                // }
                listSuggestionRef.current.style.display = "none";
                setTextSearch("");
                if (!listSuggestionRef.current.children[activeIndex]) return;
                if (
                  listSuggestionRef.current.children[activeIndex].className !==
                  "active"
                )
                  setAllSelectedOptions([
                    ...allSelectedOptions,
                    { ...dataSuggestions[activeIndex] },
                  ]);
                else
                  setAllSelectedOptions(
                    allSelectedOptions.filter(
                      ({ id }) => id !== dataSuggestions[activeIndex].id
                    )
                  );
              }
              
              if (e.key === "Escape") {
                listSuggestionRef.current.style.display = "block";
                e.preventDefault();
                listSuggestionRef.current.scroll({
                  top: 0,
                });
                listSuggestionRef.current.style.display = "none";
                setActiveIndex(0);
              }

              if (e.key === "ArrowUp") {
                listSuggestionRef.current.style.display = "block";
                e.preventDefault();
                if (activeIndex > 0) setActiveIndex(activeIndex - 1);
                const startIndex = Math.round(
                  listSuggestionRef.current.scrollTop / 35.2
                );

                if (activeIndex <= startIndex) {
                  listSuggestionRef.current.scroll({
                    top: (activeIndex - 1) * 35.2,
                  });
                }
              }

              if (e.key === "ArrowDown") {
                listSuggestionRef.current.style.display = "block";
                e.preventDefault();
                // if (activeIndex === null) setActiveIndex(0);
                if (activeIndex < dataSuggestions.length - 1)
                  setActiveIndex(activeIndex + 1);
                const startIndex = Math.ceil(
                  listSuggestionRef.current.scrollTop / 35.2
                );
                const endIndex = startIndex + 2;
                if (activeIndex > endIndex) {
                  listSuggestionRef.current.scroll({
                    top: (activeIndex - 3) * 35.2,
                  });
                }
              }

              if (
                e.key === "Backspace" &&
                inputRef.current.value === "" &&
                allSelectedOptions.length > 0
              ) {
                listSuggestionRef.current.style.display = "block";
                inputRef.current.value =
                  allSelectedOptions[allSelectedOptions.length - 1].name + " ";
                setAllSelectedOptions(
                  allSelectedOptions.slice(0, allSelectedOptions.length - 1)
                );
              }
            }}
          />
        </div>
        <ul
          className="list-suggestion"
          style={{
            maxHeight: 35.2 * 5,
          }}
          ref={listSuggestionRef}
        >
          {dataSuggestions.length === 0 && <div>No Results</div>}
          {dataSuggestions.map((data, index) => (
            <li
              style={{
                backgroundColor:
                  activeIndex === index ? "rgb(110, 110, 110)" : "",
              }}
              className={
                checkIfActiveItem(allSelectedOptions, data.id) ? "active" : ""
              }
              onClick={(e: any) => {
                inputRef.current.focus();
                inputRef.current.value = "";
                listSuggestionRef.current.style.display = "none";
                if (e.target.className !== "active")
                  setAllSelectedOptions([...allSelectedOptions, { ...data }]);
                else
                  setAllSelectedOptions(
                    allSelectedOptions.filter(({ id }) => id !== data.id)
                  );
              }}
              key={index}
            >
              {data.name}
            </li>
          ))}
        </ul>
      </div>
    </fieldset>
  );
};

function checkIfActiveItem(allSelectedItemList: Tag[] | [], id: number) {
  return allSelectedItemList.map((data) => data.id).includes(id);
}

export default CustomSelect2;
