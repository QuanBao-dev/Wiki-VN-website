import "./Admin.css";

import { useEffect, useRef, useState } from "react";

import ButtonDeleteUser from "../../components/ButtonDeleteUser/ButtonDeleteUser";
import { User } from "../../Interfaces/users";
import { useFetchApi } from "../Hooks/useFetchApi";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { userStore } from "../../store/user";
import ButtonEdit from "../../components/ButtonEdit/ButtonEdit";
import { notificationStore } from "../../store/notification";
import PopupNotificationForm from "../../components/PopupNotificationForm/PopupNotificationForm";

const Admin = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpin, setIsSpin] = useState(false);
  const updateButtonContainerRef = useRef(document.createElement("div"));
  useFetchApi(
    "/api/user/",
    setUserList,
    "users",
    [],
    true,
    true,
    setIsLoading,
    null
  );
  useEffect(() => {
    if (!updateButtonContainerRef.current) return;
    const subscription = fromEvent(updateButtonContainerRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/user/",
            method: "GET",
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          setUserList(v);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [isLoading]);
  return (
    <div className="admin-container">
      <PopupNotificationForm />
      {(isLoading || userStore.currentState().role !== "Admin") && (
        <div>
          <i
            className="fas fa-spinner fa-pulse fa-5x"
            style={{
              display: "inline-block",
              margin: "auto",
            }}
          ></i>
        </div>
      )}
      <div
        className="admin-wrapper"
        style={{
          display:
            !isLoading && userStore.currentState().role === "Admin"
              ? "block"
              : "none",
        }}
      >
        <div className="update-button-container">
          <i
            ref={updateButtonContainerRef}
            className={`fas fa-sync fa-2x${isSpin ? " fa-spin" : ""}`}
            onMouseEnter={() => {
              setIsSpin(true);
            }}
            onMouseLeave={() => {
              setIsSpin(false);
            }}
            onTouchStart={() => {
              setIsSpin(true);
            }}
            onTouchEnd={() => {
              setIsSpin(false);
            }}
          ></i>
        </div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>userId</th>
              <th>Username</th>
              <th>Role</th>
              <th>Email</th>
              <th>createdAt</th>
              <th>isVerified</th>
              <th>isVerifiedEdit</th>
              <th>isFreeAds</th>
              <th>becomingSupporterAt</th>
              <th>becomingMemberAt</th>
              <th>cancelingMemberAt</th>
              <th>endFreeAdsDate</th>
              <th>Delete</th>
              <th>Save</th>
              <th>Send Message</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(
              (
                {
                  email,
                  isVerified,
                  createdAt,
                  userId,
                  username,
                  isFreeAds,
                  becomingMemberAt,
                  becomingSupporterAt,
                  cancelingMemberAt,
                  endFreeAdsDate,
                  role,
                },
                key
              ) => (
                <RowTable
                  key={key}
                  index={key}
                  becomingMemberAt={becomingMemberAt}
                  role={role}
                  becomingSupporterAt={becomingSupporterAt}
                  cancelingMemberAt={cancelingMemberAt}
                  isFreeAds={isFreeAds}
                  endFreeAdsDate={endFreeAdsDate}
                  username={username}
                  userId={userId}
                  createdAt={createdAt}
                  isVerified={isVerified}
                  isVerifiedEdit={isVerified}
                  email={email}
                  userList={userList}
                  setUserList={setUserList}
                />
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
interface RowTableProps {
  key: number;
  userId: string;
  role: string;
  username: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
  isVerifiedEdit: boolean;
  isFreeAds: boolean;
  endFreeAdsDate: string;
  becomingSupporterAt: string;
  becomingMemberAt: string;
  cancelingMemberAt: string;
  userList: User[];
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
  index: number;
}
function RowTable({
  index,
  userId,
  username,
  email,
  createdAt,
  isVerified,
  isVerifiedEdit,
  isFreeAds,
  becomingSupporterAt,
  becomingMemberAt,
  cancelingMemberAt,
  userList,
  setUserList,
  role,
  endFreeAdsDate,
}: RowTableProps) {
  const isVerifiedEditRef = useRef(document.createElement("input"));
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{userId}</td>
      <td>{username}</td>
      <td>{role}</td>
      <td>{email}</td>
      <td>{new Date(createdAt).toUTCString()}</td>
      <td>{isVerified ? "true" : "false"}</td>
      <td>
        <input
          type="checkbox"
          defaultChecked={isVerifiedEdit ? true : false}
          ref={isVerifiedEditRef}
        />
      </td>
      <td>{isFreeAds ? "true" : "false"}</td>
      <td>{becomingSupporterAt ? becomingSupporterAt : "none"}</td>
      <td>{becomingMemberAt ? becomingMemberAt : "none"}</td>
      <td>{cancelingMemberAt ? cancelingMemberAt : "none"}</td>
      <td>{endFreeAdsDate ? endFreeAdsDate : "none"}</td>
      <td>
        <ButtonDeleteUser
          userId={userId}
          userList={userList}
          setUserList={setUserList}
        />
      </td>
      <td>
        <ButtonEdit
          userId={userId}
          isVerifiedEditRef={isVerifiedEditRef}
        />
      </td>
      <td>
        <button
          onClick={() => {
            notificationStore.updateState({
              userId,
              email,
              isHide: false,
              username,
              endFreeAdsDate,
              isFreeAds: isFreeAds ? true : false,
            });
          }}
        >
          Send message to {email}
        </button>
      </td>
    </tr>
  );
}

export default Admin;
