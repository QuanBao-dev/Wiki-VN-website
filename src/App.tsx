import "./App.css";

import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import NavBar from "./components/NavBar/NavBar";
import Detail from "./pages/Detail/Detail";
import RandomVNList from "./components/RandomVNList/RandomVNList";
import Register from "./pages/Register/Register";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="app-container">
        <Routes>
          <Route path="/vns/:id" element={<Detail />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/" element={<Home />}></Route>
        </Routes>
        <div className="side-section-container">
          <RandomVNList />
        </div>
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
