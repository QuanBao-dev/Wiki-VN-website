import "./SearchVN.css";

import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { VisualNovel } from "../../Interfaces/visualNovelList";
import { useInputChange } from "../../pages/Hooks/useInputChange";
import { useInputKeydown } from "../../pages/Hooks/useInputKeydown";

const SearchVN = () => {
  const inputSearchRef = useRef(document.createElement("input"));
  const suggestionListContainerRef = useRef(document.createElement("ul"));
  const [suggestions, setSuggestions] = useState<VisualNovel[] | []>([]);
  const [indexActive, setIndexActive] = useState<number | null>(null);
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
    <div
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
                <img
                  src={
                    !suggestion.image_nsfw
                      ? suggestion.image
                      : "/nsfw-warning.webp"
                  }
                  alt=""
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
    </div>
  );
};

export default SearchVN;
