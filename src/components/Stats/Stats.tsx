import "./Stats.css";

import { useState } from "react";

import { SugoiVNDBStats } from "../../Interfaces/dbstats";
import { useFetchApi } from "../../pages/Hooks/useFetchApi";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";

const Stats = () => {
  const [stats, setStats] = useState<SugoiVNDBStats>();
  const [isLoading, setIsLoading] = useState(false);
  useFetchApi(
    "/api/stats",
    setStats,
    "SugoiVNDB",
    [],
    true,
    true,
    setIsLoading,
    null
  );
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
          <div>{stats?.mtledVNLength}</div>
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
