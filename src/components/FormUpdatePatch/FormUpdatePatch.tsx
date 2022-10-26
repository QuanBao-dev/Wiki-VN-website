import "./FormUpdatePatch.css";
import Input from "../Input/Input";
import { useRef, useEffect } from "react";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { VisualNovel } from "../../Interfaces/visualNovelList";
interface Props {
  dataVN: VisualNovel;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: boolean;
}
const FormUpdatePatch = ({ dataVN, setTrigger, trigger }: Props) => {
  const labelInputRef = useRef(document.createElement("input"));
  const patchReleaseUrlInputRef = useRef(document.createElement("input"));
  const checkBoxRef = useRef(document.createElement("input"));
  const buttonRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = fromEvent(buttonRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/patch/",
            method: "POST",
            body: {
              linkDownloads: {
                label: labelInputRef.current.value,
                url: patchReleaseUrlInputRef.current.value,
              },
              vnId: dataVN.id,
              dataVN: dataVN,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          setTrigger(!trigger);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVN.id, trigger]);
  return (
    <fieldset>
      <legend>Form Update Patch</legend>
      <Input label="Label Patch" type="text" inputRef={labelInputRef} />
      <Input
        label="Patch Release Url"
        type="text"
        inputRef={patchReleaseUrlInputRef}
      />
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <input id="checkbox" type="checkbox" ref={checkBoxRef} />
        <label
          htmlFor="checkbox"
          style={{
            fontWeight: 600,
          }}
        >
          Add Patch
        </label>
      </div>
      <button ref={buttonRef} className="form-update-patch-button">
        Submit
      </button>
    </fieldset>
  );
};

export default FormUpdatePatch;
