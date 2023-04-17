import "./FormUpdatePatch.css";
import Input from "../Input/Input";
import { useRef, useEffect, useState } from "react";
import { catchError, debounceTime, exhaustMap, fromEvent, of, pluck } from "rxjs";
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
  const checkBoxIsMemberOnlyRef = useRef(document.createElement("input"));
  const checkBoxIsNotifyRef = useRef(document.createElement("input"));
  const [announcementChannel, setAnnouncementChannel] = useState(
    "1063717809114329140"
  );
  const [isNotify, setIsNotify] = useState(false);
  const buttonRef = useRef(document.createElement("button"));
  const selectRef = useRef(document.createElement("select"));
  console.log(dataVN)
  useEffect(() => {
    const subscription = fromEvent(buttonRef.current, "click")
      .pipe(
        debounceTime(1000),
        exhaustMap(() =>
          ajax({
            url: "/api/patch/",
            method: "POST",
            body: {
              type: selectRef.current.value,
              linkDownload: {
                label: labelInputRef.current.value,
                url: patchReleaseUrlInputRef.current.value,
              },
              vnId: dataVN.id,
              dataVN: dataVN,
              isAddingNewPatch: checkBoxRef.current.checked,
              isMemberOnly: checkBoxIsMemberOnlyRef.current.checked,
              announcementChannel: isNotify ? announcementChannel : undefined,
              isNotifyDiscord: isNotify,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (v && !v.error) {
          setTrigger(!trigger);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVN.id, trigger, announcementChannel, isNotify]);
  return (
    <fieldset>
      <legend>Form Update Patch</legend>
      <select
        name=""
        id=""
        ref={selectRef}
        defaultValue={"download"}
        className="select-type-link"
      >
        <option value="download">Link Download</option>
        <option value="affiliate">Affiliate Link</option>
      </select>
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
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <input
          id="checkbox-is-member-only"
          type="checkbox"
          ref={checkBoxIsMemberOnlyRef}
        />
        <label
          htmlFor="checkbox-is-member-only"
          style={{
            fontWeight: 600,
          }}
        >
          Is member only
        </label>
      </div>
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <input
          id="checkbox-is-notify"
          type="checkbox"
          ref={checkBoxIsNotifyRef}
        />
        <label
          htmlFor="checkbox-is-notify"
          style={{
            fontWeight: 600,
          }}
          onClick={() => setIsNotify(!isNotify)}
        >
          Is Notify
        </label>
      </div>
      {isNotify && (
        <select
          defaultValue={announcementChannel}
          onChange={(v) => {
            setAnnouncementChannel(v.target.value);
          }}
        >
          <option value="1063717809114329140">new-releases</option>
          <option value="1070419123084984361">early-access-releases</option>
          <option value="1072212373303214100">untranslatable-game</option>
          <option value="1066129550091763905">private</option>
        </select>
      )}
      <button ref={buttonRef} className="form-update-patch-button">
        Submit
      </button>
    </fieldset>
  );
};

export default FormUpdatePatch;
