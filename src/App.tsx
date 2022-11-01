import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import RandomVNList from "./components/RandomVNList/RandomVNList";
import Detail from "./pages/Detail/Detail";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Verify from "./pages/Verify/Verify";
import Account from "./pages/Account/Account";
import { userStore } from "./store/user";
import { useState } from "react";
import { useInitStore } from "./pages/Hooks/useInitStore";
import NotFound from "./pages/NotFound/NotFound";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

function App() {
  const [userState, setUserState] = useState(userStore.currentState());
  useInitStore(userStore, setUserState);
  document.body.style.backgroundImage = `url("${window.location.origin}/background.jpg")`;
  return (
    <BrowserRouter>
      <NavBar />
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          <Route
            path="/vns/:id"
            element={
              <div className="app-container-2">
                <Detail />
                <div className="side-section-container">
                  <RandomVNList />
                </div>
              </div>
            }
          />
          {userState.role === "" && <Route path="/login" element={<Login />} />}
          {userState.role === "" && (
            <Route path="/register" element={<Register />} />
          )}
          <Route path="/verify/:token" element={<Verify />} />
          {userState.role !== "" && (
            <Route path="/account" element={<Account />} />
          )}
          <Route
            path="/"
            element={
              <div className="app-container-2">
                <Home />
                <div className="side-section-container">
                  <RandomVNList />
                </div>
              </div>
            }
          ></Route>
          <Route path="/*" element={<NotFound />}></Route>
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
