import "./Admin.css";

import { useEffect, useRef, useState } from "react";

import ButtonDeleteUser from "../../components/ButtonDeleteUser/ButtonDeleteUser";
import { User } from "../../Interfaces/users";
import { useFetchApi } from "../Hooks/useFetchApi";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { userStore } from "../../store/user";

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
        <i className="fas fa-spinner fa-pulse"></i>
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
            <th>isFreeAds</th>
            <th>becomingSupporterAt</th>
            <th>becomingMemberAt</th>
            <th>cancelingMemberAt</th>
            <th></th>
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
                cancelingMemberAt
              },
              key
            ) => (
              <tr key={key}>
                <td>{key + 1}</td>
                <td>{userId}</td>
                <td>{username}</td>
                <td>{email}</td>
                <td>{new Date(createdAt).toUTCString()}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={isVerified ? true : false}
                    onChange={(e) => {
                      const target = e.target as any;
                      console.log(target.checked);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={isFreeAds ? true : false}
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
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
