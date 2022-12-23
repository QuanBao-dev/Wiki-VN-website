import "./FormUpdateTranslatable.css";
import { useRef, useEffect, useState } from "react";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { homeStore } from "../../store/home";
import { updateCaches } from "../../util/updateCaches";
interface Props {
  dataVN: VisualNovel;
}
const choices = [
  "This VN has already had a English patch for this VN",
  "There's someone else in the process of translating this VN",
  "This VN is untranslatable because there's no available tool to create the patch for it",
];
const FormUpdateTranslatable = ({ dataVN }: Props) => {
  const formUpdateTranslatableRef = useRef(document.createElement("input"));
  const buttonRef = useRef(document.createElement("button"));
  const [indexActive, setIndexActive] = useState(10);
  useEffect(() => {
    const subscription = fromEvent(buttonRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/vote/" + dataVN.id + "/translatable",
            method: "PUT",
            body: {
              dataVN,
              isTranslatable: formUpdateTranslatableRef.current.checked,
              reason: choices[indexActive] || "",
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (v && !v.error) {
          homeStore.updateState({
            isStopFetching: false,
            isLoading: true,
          });
          updateCaches([], "rankingVNs");
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVN.id]);
  return (
    <fieldset className="form-update-translatable">
      <legend>Form update vote</legend>
      <h3>Choices of reason</h3>
      <ul className="list-options-container">
        {choices.map((choice, key) => (
          <li
            key={key}
            onClick={() => {
              if (key === indexActive) {
                setIndexActive(10);
              } else {
                setIndexActive(key);
              }
            }}
          >
            <div>
              <span className={indexActive === key ? "active" : ""}></span>
              <label>{choice}</label>
            </div>
          </li>
        ))}
      </ul>
      <div
        style={{
          margin: "10px 0",
        }}
      >
        <input
          type="checkbox"
          id="checkbox-translatable"
          ref={formUpdateTranslatableRef}
        />
        <label htmlFor="checkbox-translatable">Translatable</label>
      </div>
      <button className="form-update-patch-button" ref={buttonRef}>
        Submit
      </button>
    </fieldset>
  );
};

export default FormUpdateTranslatable;
