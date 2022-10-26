import "./Account.css";

import { useEffect, useRef, useState } from "react";
import { catchError, filter, fromEvent, map, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";

import { userStore } from "../../store/user";
import { useInitStore } from "../Hooks/useInitStore";
const Account = () => {
  const [userState, setUserState] = useState(userStore.currentState());
  const inputFileRef = useRef(document.createElement("input"));
  useInitStore(userStore, setUserState);
  useEffect(() => {
    const subscription = fromEvent(inputFileRef.current, "change")
      .pipe(
        pluck("target", "files"),
        filter((files: any) => files[0]),
        map((files: any) => files[0]),
        switchMap(async (file: any) => {
          const fileReader = (await convertBlobToBase64(file)) as any;
          userStore.updateState({
            avatarImage: fileReader.currentTarget.result,
          });
          return of(fileReader.currentTarget.result);
        }),
        switchMap((v) => v),
        switchMap((avatarImage: string) =>
          ajax({
            method: "PUT",
            url: "/api/user/edit",
            body: {
              avatarImage,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((res: any) => {
        if (!res.error) {
          userStore.updateState({
            trigger: !userStore.currentState().trigger,
            isShowEditAccount: !userStore.currentState().isShowEditAccount,
          });
        } else {
          console.error(res.error);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="account-setting-container">
      <div className="account-setting-wrapper">
        <div className="avatar-image-container">
          <img
            className="avatar-image"
            src={userState.avatarImage}
            alt=""
            onClick={() => {
              inputFileRef.current.click();
            }}
          ></img>
          <input
            type="file"
            ref={inputFileRef}
            style={{ display: "none" }}
            accept={"image/*"}
          />
          <div>{userState.username}</div>
        </div>
        <div className="detail-account-container">
          <div className="detail-account-item">
            <div>
              <label>Username</label>
              <div>{userState.username}</div>
            </div>
            <button
              onClick={() => {
                userStore.updateState({
                  isShowEditAccount: true,
                  editMode: "username",
                });
              }}
            >
              Edit
            </button>
          </div>
          <div className="detail-account-item">
            <div>
              <label>Email</label>
              <div>{userState.email}</div>
            </div>
            <button
              onClick={() => {
                userStore.updateState({
                  isShowEditAccount: true,
                  editMode: "email",
                });
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function convertBlobToBase64(files: Blob) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (fileContent) => {
      res(fileContent);
    };
    reader.onerror = (error) => {
      rej(error);
    };
    reader.readAsDataURL(files);
  });
}

export default Account;
