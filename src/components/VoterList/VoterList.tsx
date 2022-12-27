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
  const [lastPage, setLastPage] = useState(0);
  useInitStore(homeStore, setHomeState);
  useFetchApi(
    `/api/user/${id}/vote?page=${page}`,
    (v: any) => {
      const { data, lastPage, isNew } = v;
      if (!isNew) {
        setUserList([...userList, ...data]);
      } else {
        setUserList(data);
      }
      setLastPage(lastPage);
    },
    "userVotes",
    [id, page, homeState],
    true,
    true,
    undefined,
    () => {
      setUserList([]);
    }
  );
  if (userList.length === 0) return <div></div>;
  return (
    <div className="voter-list-container">
      <fieldset>
        <legend>Voters ({lastPage})</legend>
        {userList && (
          <table className="voter-list-wrapper">
            <thead>
              <tr className="container-voter-item">
                <th>Avatar</th>
                <th>username</th>
                <th>role</th>
                <th>boost</th>
              </tr>
            </thead>
            <tbody>
              {userList
                .slice(0, (page + 1) * 10)
                .map(({ username, role, avatarImage, boost }) => (
                  <tr key={username} className="container-voter-item">
                    <td>
                      {avatarImage && (
                        <img src={avatarImage} alt="" width={"40px"} />
                      )}
                      {!avatarImage && (
                        <img src={"/avatar.webp"} alt="" width={"40px"} />
                      )}
                    </td>
                    <td>{username}</td>
                    <td>{role}</td>
                    <td>x{boost}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {lastPage !== userList.length && (
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
