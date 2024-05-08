import "./SearchVN.css";

import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useInputChange } from "../../pages/Hooks/useInputChange";
import { useInputKeydown } from "../../pages/Hooks/useInputKeydown";
import { LazyLoadImage } from "react-lazy-load-image-component";

const SearchVN = () => {
  const inputSearchRef = useRef(document.createElement("input"));
  const suggestionListContainerRef = useRef(document.createElement("ul"));
  const [suggestions, setSuggestions] = useState<VisualNovel[] | []>([]);
  const [indexActive, setIndexActive] = useState<number | null>(0);
  useInputChange(
    inputSearchRef,
    "/api/vndb?title={text}",
    setSuggestions,
    setIndexActive
  );
  useInputKeydown(
    inputSearchRef,
    setIndexActive,
    indexActive,
    suggestionListContainerRef,
    suggestions.length
  );
  return (
    <form
      className="search-VNs-container"
      onClick={() => {
        inputSearchRef.current.focus();
      }}
    >
      <input type="text" ref={inputSearchRef} placeholder={"Search..."} />
      {suggestions.length > 0 && (
        <ul
          className="suggestion-list-container"
          ref={suggestionListContainerRef}
        >
          {suggestions.map((suggestion, key) => (
            <Link to={"/vns/" + suggestion.id} key={key}>
              <li
                className={`suggestion-item${
                  indexActive === key + 1 ? " active" : ""
                }`}
              >
                <LazyLoadImage
                  src={
                    !suggestion.image_nsfw
                      ? suggestion.image
                      : suggestion.screens &&
                        suggestion.screens.filter(({ nsfw }) => !nsfw)[0]
                      ? suggestion.screens.filter(({ nsfw }) => !nsfw)[0].image
                      : "/background.jpg"
                  }
                  alt=""
                  effect="opacity"
                />
                <div>
                  <h4>{(suggestion as any).title}</h4>
                  <div className="suggestion-description">
                    {suggestion.description}
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </form>
  );
};

export default SearchVN;
