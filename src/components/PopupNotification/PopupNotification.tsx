import { useEffect, useRef } from "react";
import { catchError, exhaustMap, fromEvent, of, pluck } from "rxjs";
import { ajax } from "rxjs/ajax";
import "./PopupNotification.css";
interface Props {
  title: string;
  message: string;
}
const PopupNotification = ({ title, message }: Props) => {
  const popupNotificationContainerRef = useRef(document.createElement("div"));
  const popupNotificationButtonRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = fromEvent(popupNotificationButtonRef.current, "click")
      .pipe(
        exhaustMap(() =>
          ajax({
            url: "/api/notification/",
            method: "DELETE",
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          popupNotificationContainerRef.current.style.display = "none";
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [title]);
  if (!title) return <div></div>;
  return (
    <div
      className="popup-notification-container"
      ref={popupNotificationContainerRef}
    >
      <div className="popup-notification-wrapper">
        <h1>{title}</h1>
        <p>{message}</p>
        <button ref={popupNotificationButtonRef}>Ok</button>
      </div>
    </div>
  );
};

export default PopupNotification;
