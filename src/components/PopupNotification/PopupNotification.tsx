import "./PopupNotification.css";

import { useEffect, useRef } from "react";
import { catchError, exhaustMap, fromEvent, iif, of, pluck } from "rxjs";
import { ajax } from "rxjs/ajax";
import { userStore } from "../../store/user";

interface Props {
  title: string;
  message: string;
  isNoFetch?: boolean;
}
const PopupNotification = ({ title, message, isNoFetch }: Props) => {
  const popupNotificationContainerRef = useRef(document.createElement("div"));
  const popupNotificationButtonRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = iif(
      () => !isNoFetch,
      fromEvent(popupNotificationButtonRef.current, "click").pipe(
        exhaustMap(() =>
          ajax({
            url: "/api/notification/",
            method: "DELETE",
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      ),
      fromEvent(popupNotificationButtonRef.current, "click")
    ).subscribe((v) => {
      if (!v.error) {
        popupNotificationContainerRef.current.style.display = "none";
        userStore.updateState({
          isFilterNsfw: false,
          isShowNotiFilter: false,
        });
        window.localStorage.setItem(
          "isFilterNsfwSVN",
          JSON.stringify(userStore.currentState().isFilterNsfw)
        );
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [isNoFetch, title]);
  if (!title) return <div></div>;
  return (
    <div
      className="popup-notification-container"
      ref={popupNotificationContainerRef}
    >
      <div className="popup-notification-wrapper">
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="popup-button-container">
          {isNoFetch && (
            <button
              style={{
                backgroundColor: "red",
              }}
              onClick={() => {
                userStore.updateState({
                  isFilterNsfw: true,
                  isShowNotiFilter: false,
                });
                window.localStorage.setItem(
                  "isFilterNsfwSVN",
                  JSON.stringify(userStore.currentState().isFilterNsfw)
                );
              }}
            >
              Cancel
            </button>
          )}
          <button ref={popupNotificationButtonRef}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
