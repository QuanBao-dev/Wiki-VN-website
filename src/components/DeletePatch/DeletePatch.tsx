import "./DeletePatch.css";
import { useRef, useEffect } from "react";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
interface Props {
  vnId: number;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: boolean
}
const DeletePatch = ({ vnId, setTrigger, trigger }: Props) => {
  const deletePatchRef = useRef(document.createElement("i"));
  useEffect(() => {
    const subscription = fromEvent(deletePatchRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            method:"DELETE",
            url: "/api/patch/" + vnId,
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          setTrigger(!trigger)
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, vnId]);
  return (
    <div>
      <i className="fas fa-times" ref={deletePatchRef}></i>
    </div>
  );
};

export default DeletePatch;
