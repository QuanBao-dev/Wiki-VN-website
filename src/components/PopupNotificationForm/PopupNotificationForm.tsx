import "./PopupNotificationForm.css";

import { useEffect, useRef, useState } from "react";
import {
  catchError,
  combineAll,
  exhaustMap,
  filter,
  from,
  fromEvent,
  of,
  pluck,
  startWith,
  tap,
} from "rxjs";
import { ajax } from "rxjs/ajax";

import { notificationStore } from "../../store/notification";
import Input from "../Input/Input";
import { useInitStore } from "../../pages/Hooks/useInitStore";

const PopupNotificationForm = () => {
  const titleRef = useRef(document.createElement("input"));
  const messageRef = useRef(document.createElement("input"));
  const formContainerRef = useRef(document.createElement("form"));
  const [errorMessage, setErrorMessage] = useState("");
  const buttonRef = useRef(document.createElement("button"));
  const [notificationState, setNotificationState] = useState(
    notificationStore.currentState()
  );
  useInitStore(notificationStore, setNotificationState);
  useEffect(() => {
    const subscription = from([
      fromEvent(buttonRef.current, "click").pipe(startWith("")),
      fromEvent(formContainerRef.current, "keydown").pipe(
        startWith(""),
        filter((e) => e === "" || (e as any).key === "Enter")
      ),
    ])
      .pipe(
        combineAll(),
        tap(([eventClick, eventKeyDown]) => {
          if (typeof eventClick !== "string") eventClick.preventDefault();
          if (typeof eventKeyDown !== "string") eventKeyDown.preventDefault();
          setErrorMessage("");
        }),
        filter(
          ([eventClick, eventKeyDown]) =>
            (eventClick !== "" || eventKeyDown !== "") &&
            notificationState.userId !== ""
        ),
        exhaustMap(() =>
          ajax({
            url: "/api/notification/" + notificationState.userId,
            method: "PUT",
            body: {
              message: messageRef.current.value,
              title: titleRef.current.value,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          notificationStore.updateState({ isHide: true });
        } else {
          setErrorMessage(v.error);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [notificationState.userId]);
  useEffect(() => {
    if (!notificationState.isFreeAds) {
      titleRef.current.value = ``;
      messageRef.current.value = ``;
      return;
    }
    titleRef.current.value = `Thank you for your support`;
    messageRef.current.value = `Hi ${
      notificationState.username
    }! Now you can freely download the patches on this website without ads ${
      notificationState.endFreeAdsDate
        ? "for 1 month since the day you supported"
        : "as long as you are still a membership"
    }. ${
      notificationState.endFreeAdsDate
        ? `This will be end at ${notificationState.endFreeAdsDate}`
        : ""
    }`;
  }, [
    notificationState.username,
    notificationState.endFreeAdsDate,
    notificationState.isFreeAds,
  ]);
  return (
    <div
      className="popup-notification-form-container"
      style={{
        display: notificationState.isHide ? "none" : "flex",
      }}
      onClick={(e) => {
        const target = e.target as any;
        if (target.className === "popup-notification-form-container") {
          notificationStore.updateState({
            isHide: true,
          });
        }
      }}
    >
      <form ref={formContainerRef} className="popup-notification-form-wrapper">
        <h2>Notification to {notificationState.email}</h2>
        {errorMessage !== "" && (
          <div className="error-container">{errorMessage}</div>
        )}
        <Input label="title" inputRef={titleRef} type="text" />
        <Input label="message" inputRef={messageRef} type="text" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            className="form-notification-button"
            style={{
              color: "black",
              backgroundColor: "white",
              fontWeight: 600,
            }}
            onClick={() => {
              titleRef.current.value = "";
              messageRef.current.value = "";
            }}
          >
            Clear
          </button>
          <button className="form-notification-button" ref={buttonRef}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default PopupNotificationForm;
