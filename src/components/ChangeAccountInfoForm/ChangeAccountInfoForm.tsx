import "./ChangeAccountInfoForm.css";

import { useEffect, useRef, useState } from "react";
import {
  catchError,
  combineAll,
  filter,
  from,
  fromEvent,
  of,
  pluck,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { ajax } from "rxjs/ajax";

import { useInitStore } from "../../pages/Hooks/useInitStore";
import { userStore } from "../../store/user";
import Input from "../Input/Input";
import { chatStore } from "../../store/Chat";
import { updateCaches } from "../../util/updateCaches";

const ChangeAccountInfoForm = () => {
  const inputUsernameEmailDiscordRef = useRef(document.createElement("input"));
  const inputPasswordRef = useRef(document.createElement("input"));
  const [userState, setUserState] = useState(userStore.currentState());
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef(document.createElement("form"));
  const buttonSubmitRef = useRef(document.createElement("button"));
  useInitStore(userStore, setUserState);
  useEffect(() => {
    if (userState.isShowEditAccount) {
      switch (userState.editMode) {
        case "username":
          inputUsernameEmailDiscordRef.current.value = userState.username;
          break;
        case "email":
          inputUsernameEmailDiscordRef.current.value = userState.email;
          break;
        case "discord username":
          inputUsernameEmailDiscordRef.current.value =
            userState.discordUsername;
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState.isShowEditAccount]);

  useEffect(() => {
    const subscription = fromEvent(window, "click").subscribe((e) => {
      if (
        (e.target as any).className === "change-account-info-container-form"
      ) {
        userStore.updateState({
          isShowEditAccount: false,
        });
        setErrorMessage("");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = from([
      fromEvent(buttonSubmitRef.current, "click").pipe(startWith("")),
      fromEvent(formRef.current, "keydown").pipe(
        startWith(""),
        filter((e) => (e as any).key === "Enter" || e === "")
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
            eventClick !== "" || eventKeyDown !== ""
        ),
        switchMap(() =>
          ajax({
            method: "PUT",
            url: "/api/user/edit",
            body: {
              username:
                userState.editMode === "username"
                  ? inputUsernameEmailDiscordRef.current.value
                  : undefined,
              email:
                userState.editMode === "email"
                  ? inputUsernameEmailDiscordRef.current.value
                  : undefined,
              discordUsername:
                userState.editMode === "discord username"
                  ? inputUsernameEmailDiscordRef.current.value
                  : undefined,
              password: inputPasswordRef.current.value,
            },
          }).pipe(catchError((error) => of(error).pipe(pluck("response"))))
        ),
        switchMap((res) => {
          if (res.error) {
            setErrorMessage(res.error);
            if (
              res.error.includes(
                "Checking your email account, Please verify your new email"
              )
            ) {
              return ajax({
                method: "DELETE",
                url: "/api/user/logout",
              }).pipe(
                pluck("response", "message"),
                catchError((error) => of(error).pipe(pluck("response")))
              );
            }
          }
          return of(res);
        })
      )
      .subscribe((res: any) => {
        if (!res.error) {
          inputPasswordRef.current.value = "";
          userStore.updateState({
            trigger: !userStore.currentState().trigger,
            isShowEditAccount: false,
          });
          if (["Admin", "Member"].includes(userStore.currentState().role)) {
            chatStore.updateState({
              isStopFetching: false,
              isLoading: true,
              page: 1,
              ratio: 1,
              scrollTop: 1000000,
            });
            updateCaches([], "messages");
          }
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState.editMode]);
  return (
    <div
      className="change-account-info-container-form"
      style={{
        display: userState.isShowEditAccount ? "flex" : "none",
      }}
    >
      <form className="change-account-info-wrapper-form" ref={formRef}>
        <h1>Change your {userState.editMode}</h1>
        {errorMessage !== "" && (
          <div className="error-container-edit-account">{errorMessage}</div>
        )}
        <Input
          label={userState.editMode}
          type="text"
          inputRef={inputUsernameEmailDiscordRef}
        />
        <Input label="password" type="password" inputRef={inputPasswordRef} />
        <button ref={buttonSubmitRef}>Submit</button>
      </form>
    </div>
  );
};

export default ChangeAccountInfoForm;
