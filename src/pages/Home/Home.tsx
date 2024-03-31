import "./Home.css";

import React, { Suspense, useEffect } from "react";
import { fromEvent } from "rxjs";

import SkeletonLoading from "../../components/SkeletonLoading/SkeletonLoading";
import { homeStore } from "../../store/home";

const SearchVN = React.lazy(() => import("../../components/SearchVN/SearchVN"));
const CardListVN = React.lazy(
  () => import("../../components/CardListVN/CardListVN")
);

const Home = () => {
  useEffect(() => {
    const subscription = fromEvent(window, "scroll").subscribe(() => {
      homeStore.updateState({
        currentScrollTop: window.scrollY,
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
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
