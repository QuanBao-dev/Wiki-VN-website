import "./App.css";

import React, { Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SkeletonLoading from "./components/SkeletonLoading/SkeletonLoading";
import { useInitStore } from "./pages/Hooks/useInitStore";
import { userStore } from "./store/user";
import Stats from "./components/Stats/Stats";

const RandomVNList = React.lazy(
  () => import("./components/RandomVNList/RandomVNList")
);
const Account = React.lazy(() => import("./pages/Account/Account"));
const NotFound = React.lazy(() => import("./pages/NotFound/NotFound"));
const Home = React.lazy(() => import("./pages/Home/Home"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Register = React.lazy(() => import("./pages/Register/Register"));
const Detail = React.lazy(() => import("./pages/Detail/Detail"));
const Verify = React.lazy(() => import("./pages/Verify/Verify"));
const Admin = React.lazy(() => import("./pages/Admin/Admin"));

function App() {
  const [userState, setUserState] = useState(userStore.currentState());
  useInitStore(userStore, setUserState);
  document.body.style.backgroundImage = `url("${window.location.origin}/background.jpg")`;
  return (
    <BrowserRouter>
      <NavBar />
      <ScrollToTop />
      <div
        className={`app-container${userState.isDarkMode ? " dark-mode" : ""}`}
      >
        <Routes>
          <Route
            path="/vns/:id"
            element={
              <div className="app-container-2">
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
                  <Detail />
                </Suspense>
                <div className="side-section-container">
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
                    <RandomVNList />
                  </Suspense>
                  <Suspense
                    fallback={
                      <SkeletonLoading
                        isLoading={true}
                        height={700}
                        width={`${100}%`}
                        LoadingComponent={undefined}
                        margin={3}
                      />
                    }
                  >
                    <Stats />
                  </Suspense>
                </div>
              </div>
            }
          />
          {userState.role === "" && (
            <Route
              path="/login"
              element={
                <Suspense fallback={<h1 className="loading-3-dot">Loading...</h1>}>
                  <Login />
                </Suspense>
              }
            />
          )}
          {userState.role === "" && (
            <Route
              path="/register"
              element={
                <Suspense fallback={<h1 className="loading-3-dot">Loading...</h1>}>
                  <Register />
                </Suspense>
              }
            />
          )}
          <Route
            path="/verify/:token"
            element={
              <Suspense fallback={<h1 className="loading-3-dot">Loading...</h1>}>
                <Verify />
              </Suspense>
            }
          />
          {userState.role !== "" && (
            <Route
              path="/account"
              element={
                <Suspense fallback={<h1 className="loading-3-dot">Loading...</h1>}>
                  <Account />
                </Suspense>
              }
            />
          )}
          <Route
            path="/"
            element={
              <div className="app-container-2">
                <Suspense
                  fallback={
                    <SkeletonLoading
                      isLoading={true}
                      height={700}
                      width={`${100}%`}
                      LoadingComponent={undefined}
                      margin={3}
                    />
                  }
                >
                  <Home />
                </Suspense>
                <div className="side-section-container">
                  <Suspense
                    fallback={
                      <SkeletonLoading
                        isLoading={true}
                        height={700}
                        width={`${100}%`}
                        LoadingComponent={undefined}
                        margin={3}
                      />
                    }
                  >
                    <RandomVNList />
                  </Suspense>
                  <Suspense
                    fallback={
                      <SkeletonLoading
                        isLoading={true}
                        height={700}
                        width={`${100}%`}
                        LoadingComponent={undefined}
                        margin={3}
                      />
                    }
                  >
                    <Stats />
                  </Suspense>
                </div>
              </div>
            }
          ></Route>
          <Route
            path="/*"
            element={
              <Suspense fallback={<h1 className="loading-3-dot">Loading...</h1>}>
                <NotFound />
              </Suspense>
            }
          ></Route>
          <Route path="/admin" element={<Admin />} ></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

// function findTheNextPalindrome(number) {
//   const string = number.toString();
//   const firstHalfNumber = string.slice(0, string.length / 2);
//   let isAll9 = true;
//   for (let i = 0; i < string.length; i++) {
//     if (string[i] !== "9") {
//       isAll9 = false;
//       break;
//     }
//   }
//   if (isAll9)
//     return (
//       "1" +
//       Array.from(Array(string.length - 1).keys())
//         .map(() => "0")
//         .join("") +
//       "1"
//     );
//   const secondHalfNumber = string.slice(
//     Math.ceil(string.length / 2),
//     string.length
//   );
//   const isLeftGreater = checkNumber(firstHalfNumber, secondHalfNumber);
//   if (string.length % 2 === 0) {
//     let temp = incBigNum(firstHalfNumber);
//     if (!isLeftGreater) {
//       return temp + temp.split("").reverse().join("");
//     } else {
//       return firstHalfNumber + firstHalfNumber.split("").reverse().join("");
//     }
//   } else {
//     let middleNumber = string[Math.floor(string.length / 2)];
//     let temp = firstHalfNumber;
//     if (!isLeftGreater) {
//       if (parseInt(middleNumber) !== 9) {
//         return (
//           temp + incBigNum(middleNumber) + temp.split("").reverse().join("")
//         );
//       } else {
//         temp = incBigNum(firstHalfNumber + middleNumber).toString();
//         return temp + temp.split("").reverse().join("").slice(1);
//       }
//     } else {
//       return temp + middleNumber + temp.split("").reverse().join("");
//     }
//   }
// }

// function checkNumber(a, b) {
//   let i = a.length - 1;
//   let j = 0;
//   let isLeftGreater = false;
//   do {
//     if (a[i] > b[j]) {
//       isLeftGreater = true;
//       break;
//     }
//     i--;
//     j++;
//   } while (a[i]);
//   return isLeftGreater;
// }

// function incBigNum(string, position = string.length - 1, remember = 0) {
//   let pos = position;
//   let temp = string;
//   if (string[pos] !== "9") {
//     return (
//       string.slice(0, pos) +
//       (parseInt(string[pos]) + (string.length - 1 === pos ? 1 : 0) + remember) +
//       string.slice(pos + 1)
//     );
//   } else {
//     temp = temp.slice(0, pos) + "0" + string.slice(pos + 1);
//     if (pos !== 0) {
//       return incBigNum(temp, pos - 1, 1);
//     }
//   }
//   return (
//     "1" +
//     Array.from(Array(string.length))
//       .map(() => "0")
//       .join("")
//   );
// }
