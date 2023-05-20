import "./Characters.css";

import { useEffect, useRef, useState } from "react";

import { Character } from "../../Interfaces/Character";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import { userStore } from "../../store/user";
import Description from "../Description/Description";
import cachesStore from "../../store/caches";
import { Link } from "react-router-dom";

interface Props {
  vnId: string;
}
const Characters = ({ vnId }: Props) => {
  const [pageActive, setPageActive] = useState(1);
  const [characters, setCharacters] = useState<Character[]>(
    cachesStore.currentState().caches &&
      cachesStore.currentState().caches[
        "characters" + vnId + "page" + pageActive
      ]
      ? convertObjectToArray(
          cachesStore.currentState().caches[
            "characters" + vnId + "page" + pageActive
          ]
        )
      : []
  );
  const [maxPage, setMaxPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const charactersContainerFieldsetRef = useRef(
    document.createElement("fieldset")
  );
  useEffect(() => {
    setCharacters(
      cachesStore.currentState().caches &&
        cachesStore.currentState().caches[
          "characters" + vnId + "page" + pageActive
        ]
        ? convertObjectToArray(
            cachesStore.currentState().caches[
              "characters" + vnId + "page" + pageActive
            ]
          )
        : []
    );
    setMaxPage(
      cachesStore.currentState().caches &&
        cachesStore.currentState().caches[
          "characters" + vnId + "page" + pageActive
        ]
        ? cachesStore.currentState().caches[
            "characters" + vnId + "page" + pageActive
          ].maxPage
        : 0
    );
  }, [pageActive, vnId]);
  useFetchApi(
    `/api/vndb/${vnId}/characters?page=${pageActive}`,
    setCharacters,
    "characters" + vnId + "page" + pageActive,
    [pageActive],
    true,
    !(
      cachesStore.currentState().caches &&
      cachesStore.currentState().caches[
        "characters" + vnId + "page" + pageActive
      ] &&
      cachesStore.currentState().caches[
        "characters" + vnId + "page" + pageActive
      ].maxPage
    ),
    setIsLoading,
    undefined,
    undefined,
    setMaxPage
  );
  if (!isLoading && characters.length === 0) {
    return <div></div>;
  }
  console.log(characters);
  return (
    <fieldset
      className="characters-container-fieldset"
      ref={charactersContainerFieldsetRef}
    >
      <legend>Characters</legend>
      {userStore.currentState().role === "Admin" && (
        <button
          className="button-get-characters"
          onClick={() => {
            document.addEventListener("copy", (e) => {
              copyToClipboard(
                e,
                characters.reduce((ans: any, { original, name }) => {
                  ans[original] = name;
                  return ans;
                }, {})
              );
            });
            document.execCommand("copy");
          }}
        >
          Get data characters
        </button>
      )}
      {!isLoading &&
        characters.map(
          ({ name, image, original, id, description, traits, vns }) => (
            <div key={id} className="character-info">
              <div className="image-character-container">
                <ImageCharacterWrapper image={image} name={name} />
              </div>
              <table className="information-character-container">
                <thead>
                  <tr>
                    <th>Name:</th>
                    <td>{name}</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Original:</th>
                    <td>{original}</td>
                  </tr>
                  {traits.length > 0 && (
                    <tr>
                      <th>Traits:</th>
                      <td className="trait-list">
                        {traits.map((trait) => (
                          <div key={trait.id} className="trait">
                            {trait.name}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  {vns.length > 0 && (
                    <tr>
                      <th>VNs:</th>
                      <td className="visual-novel-list">
                        {vns.map(({ id, role, title }) => (
                          <div key={id}>
                            {(["primary", "main"].includes(role)
                              ? ""
                              : role + " - "
                            ).replace(/side/g, "Side character")}
                            <Link
                              className="visual-novel"
                              to={"/vns/" + id.replace("v", "")}
                            >
                              {title}
                            </Link>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  {description && (
                    <tr>
                      <th>Description:</th>
                      <td className="description">
                        <Description description={description} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <i className="fas fa-spinner fa-5x fa-spin"></i>
        </div>
      )}
      <ul className="card-list-page-list">
        {maxPage !== 1 &&
          Array.from(Array(maxPage).keys()).map((page) => (
            <li
              className={`card-list-page-item${
                page + 1 === pageActive ? " active" : ""
              }`}
              key={page}
              onClick={() => {
                setPageActive(page + 1);
                charactersContainerFieldsetRef.current.scrollIntoView();
              }}
            >
              {page + 1}
            </li>
          ))}
      </ul>
    </fieldset>
  );
};

function ImageCharacterWrapper({
  image,
  name,
}: {
  image: { sexual: number; url: string };
  name: string;
}) {
  const [isHidden, setIsHidden] = useState(
    image && image.sexual > 0.7 && userStore.currentState().isFilterNsfw
  );

  return (
    <div className="image-character-wrapper">
      <img
        style={{
          filter: isHidden ? "blur(10px)" : "",
        }}
        src={image ? image.url : "/avatar.webp"}
        alt={name}
      />
      {isHidden && (
        <div className="block-overlay">
          <div>NSFW Image (18+)</div>
          <div
            className="show-me-button"
            onClick={() => {
              setIsHidden(!isHidden);
            }}
          >
            Show me anyway
          </div>
        </div>
      )}
    </div>
  );
}

const copyToClipboard = (event: any, data: any) => {
  event.clipboardData.setData("text", JSON.stringify(data));
  event.preventDefault();
};

const convertObjectToArray = (object: any) => {
  const length = Object.values(object).length;
  return Object.values(object).slice(0, length - 1) as Character[];
};

export default Characters;
