import "./Stats.css";

import { useEffect, useState } from "react";

import { SugoiVNDBStats } from "../../Interfaces/dbstats";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";
import { homeStore } from "../../store/home";
import cachesStore from "../../store/caches";
import { userStore } from "../../store/user";
import { useInitStore } from "../../pages/Hooks/useInitStore";

const Stats = () => {
  const [stats, setStats] = useState<SugoiVNDBStats>(
    cachesStore.currentState().caches["SugoiVNDB"] || {}
  );
  const [userState, setUserState] = useState(userStore.currentState());
  const [isLoading, setIsLoading] = useState(false);
  useInitStore(userStore, setUserState);
  useFetchApi(
    `/api/stats${"&isMemberOnly=true"
      // ["Admin", "Member", "Supporter"].includes(userState.role)
      //   ? "?isMemberOnly=true"
      //   : ""
    }`,
    setStats,
    "SugoiVNDB",
    [userState.role],
    true,
    !cachesStore.currentState().caches["SugoiVNDB"],
    setIsLoading,
    null
  );
  useEffect(() => {
    if (!stats) return;
    homeStore.updateState({
      stats,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);
  if (isLoading) {
    return (
      <SkeletonLoading
        LoadingComponent={<div></div>}
        height={300}
        width={"100%"}
        isLoading={true}
        margin={0}
      />
    );
  }
  return (
    <div className="stats-container">
      <h1>Stats</h1>
      <div className="stats-wrapper">
        <div className="stats-item">
          <div>Translated Visual Novels</div>
          <div>{stats?.mtledVNLength2}</div>
        </div>
        <div className="stats-item">
          <div>Released Patch</div>
          <div>{stats?.releasesLength}</div>
        </div>
        <div className="stats-item">
          <div>Users</div>
          <div>{stats?.usersLength}</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
