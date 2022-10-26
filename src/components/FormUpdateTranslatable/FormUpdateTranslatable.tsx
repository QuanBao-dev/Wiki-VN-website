import "./FormUpdateTranslatable.css";
import { useRef, useEffect } from "react";
import { VisualNovel } from "../../Interfaces/visualNovelList";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { homeStore } from "../../store/home";
import { updateCaches } from "../../util/updateCaches";
interface Props {
  dataVN: VisualNovel;
}

const FormUpdateTranslatable = ({ dataVN }: Props) => {
  const formUpdateTranslatableRef = useRef(document.createElement("input"));
  const buttonRef = useRef(document.createElement("button"));
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
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
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
      <section>
        <div>
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
      </section>
    </fieldset>
  );
};

export default FormUpdateTranslatable;
