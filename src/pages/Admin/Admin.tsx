import "./Admin.css";

import { useEffect, useRef, useState } from "react";

import ButtonDeleteUser from "../../components/ButtonDeleteUser/ButtonDeleteUser";
import { User } from "../../Interfaces/users";
import { useFetchApi } from "../Hooks/useFetchApi";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { userStore } from "../../store/user";
import ButtonEdit from "../../components/ButtonEdit/ButtonEdit";

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
  if (isLoading || userStore.currentState().role !== "Admin")
    return (
      <div>
        <i
          className="fas fa-spinner fa-pulse fa-5x"
          style={{
            display: "inline-block",
            margin: "auto",
          }}
        ></i>
      </div>
    );
  return (
    <div className="admin-container">
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
            <th>Email</th>
            <th>createdAt</th>
            <th>isVerified</th>
            <th>isVerifiedEdit</th>
            <th>isFreeAds</th>
            <th>isFreeAdsEdit</th>
            <th>becomingSupporterAt</th>
            <th>becomingMemberAt</th>
            <th>cancelingMemberAt</th>
            <th>Delete</th>
            <th>Save</th>
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
                isFreeAdsEdit,
                becomingMemberAt,
                becomingSupporterAt,
                cancelingMemberAt,
              },
              key
            ) => (
              <RowTable
                key={key}
                index={key}
                becomingMemberAt={becomingMemberAt}
                becomingSupporterAt={becomingSupporterAt}
                cancelingMemberAt={cancelingMemberAt}
                isFreeAds={isFreeAds}
                isFreeAdsEdit={isFreeAdsEdit}
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
  );
};
interface RowTableProps {
  key: number;
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
  isVerifiedEdit: boolean;
  isFreeAds: boolean;
  becomingSupporterAt: string;
  becomingMemberAt: string;
  cancelingMemberAt: string;
  isFreeAdsEdit: boolean;
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
  isFreeAdsEdit,
  userList,
  setUserList,
}: RowTableProps) {
  const isFreeAdsEditRef = useRef(document.createElement("input"));
  const isVerifiedEditRef = useRef(document.createElement("input"));
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{userId}</td>
      <td>{username}</td>
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
      <td>
        <input
          type="checkbox"
          defaultChecked={isFreeAdsEdit ? true : false}
          ref={isFreeAdsEditRef}
          onChange={(e) => {
            const target = e.target as any;
            console.log(target.checked);
          }}
        />
      </td>
      <td>{becomingSupporterAt ? becomingSupporterAt : "none"}</td>
      <td>{becomingMemberAt ? becomingMemberAt : "none"}</td>
      <td>{cancelingMemberAt ? cancelingMemberAt : "none"}</td>
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
          isFreeAdsEditRef={isFreeAdsEditRef}
          isVerifiedEditRef={isVerifiedEditRef}
        />
      </td>
    </tr>
  );
}

export default Admin;
