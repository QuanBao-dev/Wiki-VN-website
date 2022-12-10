import "./Home.css";
import React, { Suspense } from "react";
import SkeletonLoading from "../../components/SkeletonLoading/SkeletonLoading";

const SearchVN = React.lazy(() => import("../../components/SearchVN/SearchVN"));
const CardListVN = React.lazy(
  () => import("../../components/CardListVN/CardListVN")
);

const Home = () => {
  return (
    <div className="app-wrapper">
      <Suspense
        fallback={
          <SkeletonLoading
            isLoading={true}
            height={300}
            width={`${100}%`}
            LoadingComponent={undefined}
            margin={3}
          />
        }
      >
        <SearchVN />
        <CardListVN />
      </Suspense>
    </div>
  );
};

export default Home;
