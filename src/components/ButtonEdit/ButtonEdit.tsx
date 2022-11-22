import { useEffect, useRef } from "react";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import "./ButtonEdit.css";
interface Props {
  userId: string;
  isFreeAdsEditRef: React.MutableRefObject<HTMLInputElement>;
  isVerifiedEditRef: React.MutableRefObject<HTMLInputElement>;
}
const ButtonEdit = ({ userId, isFreeAdsEditRef, isVerifiedEditRef }: Props) => {
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
              isFreeAds: isFreeAdsEditRef.current.checked,
              isVerified: isVerifiedEditRef.current.checked,
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
