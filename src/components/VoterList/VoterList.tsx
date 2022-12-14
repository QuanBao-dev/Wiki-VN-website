import { useState } from "react";
import { Voters } from "../../Interfaces/voterList";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import { useInitStore } from "../../pages/Hooks/useInitStore";
import { homeStore } from "../../store/home";
import "./VoterList.css";
interface Props {
  id?: string;
}
const VoterList = ({ id }: Props) => {
  const [userList, setUserList] = useState<Voters[]>([]);
  const [homeState, setHomeState] = useState(homeStore.currentState());
  const [page, setPage] = useState(0);
  useInitStore(homeStore,setHomeState);
  useFetchApi(
    "/api/user/" + id + "/vote",
    setUserList,
    "userVotes",
    [id, homeState],
    true,
    true,
    undefined
  );
  if (userList.length === 0) return <div></div>;
  return (
    <div className="voter-list-container">
      <fieldset>
        <legend>Voters ({userList.length})</legend>
        {userList && (
          <div>
            {userList
              .slice(0, (page + 1) * 10)
              .map(({ username, email, avatarImage, boost }) => (
                <div key={username} className="container-voter-item">
                  <span>
                    {avatarImage && (
                      <img src={avatarImage} alt="" width={"40px"} />
                    )}
                    <div>{username}</div>
                  </span>
                  <span>{email}</span>
                  <span>x{boost}</span>
                </div>
              ))}
          </div>
        )}
        {(page + 1) * 10 < userList.length && (
          <button
            className="show-more-button"
            onClick={() => {
              setPage(page + 1);
            }}
          >
            Show more
          </button>
        )}
      </fieldset>
    </div>
  );
};

export default VoterList;
