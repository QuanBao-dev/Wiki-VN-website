import { useEffect, useRef } from "react";
import { catchError, fromEvent, of, pluck, switchMap } from "rxjs";
import { ajax } from "rxjs/ajax";
import { User } from "../../Interfaces/users";
import "./ButtonDeleteUser.css";
interface Props {
  userId: string;
  userList: User[];
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
}
const ButtonDeleteUser = ({ userId, userList, setUserList }: Props) => {
  const deleteRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = fromEvent(deleteRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/user/" + userId,
            method: "DELETE",
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (!v.error) {
          setUserList(userList.filter((data) => data.userId !== userId));
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  return (
    <div>
      <button ref={deleteRef}>Delete</button>
    </div>
  );
};

export default ButtonDeleteUser;
