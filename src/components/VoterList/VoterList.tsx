import { useState } from "react";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import "./VoterList.css";
interface Props {
  id?: string;
}
const VoterList = ({ id }: Props) => {
  const [userList, setUserList] = useState();
  useFetchApi(
    "/api/user/" + id + "/vote",
    setUserList,
    "userVotes",
    [],
    true,
    true,
    undefined
  );
  console.log(userList);
  return <div></div>;
};

export default VoterList;
