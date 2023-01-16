import { useEffect, useRef } from "react";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import "./ButtonEdit.css";
interface Props {
  userId: string;
  isVerifiedEditRef: React.MutableRefObject<HTMLInputElement>;
  roleRef: React.MutableRefObject<HTMLSelectElement>;
  boostRef: React.MutableRefObject<HTMLSelectElement>;
  isNotSpamRef: React.MutableRefObject<HTMLSelectElement>;
}
const ButtonEdit = ({
  userId,
  isVerifiedEditRef,
  roleRef,
  boostRef,
  isNotSpamRef,
}: Props) => {
  const buttonEditRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = fromEvent(buttonEditRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/user/admin/edit",
            method: "PUT",
            body: {
              userId,
              isVerified: isVerifiedEditRef.current.checked,
              role: roleRef.current.value,
              boost: +boostRef.current.value,
              isNotSpam: isNotSpamRef.current.value === "true",
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          console.log(v);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  return (
    <div>
      <button ref={buttonEditRef}>Save</button>
    </div>
  );
};

export default ButtonEdit;
