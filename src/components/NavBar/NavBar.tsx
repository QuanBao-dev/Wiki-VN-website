import "./NavBar.css";

import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  catchError,
  debounceTime,
  fromEvent,
  of,
  pluck,
  switchMap,
  timer,
} from "rxjs";
import { ajax } from "rxjs/ajax";

import { useInitStore } from "../../pages/Hooks/useInitStore";
import { userStore } from "../../store/user";
import ChangeAccountInfoForm from "../ChangeAccountInfoForm/ChangeAccountInfoForm";
import Donate from "../Donate/Donate";

const NavBar = () => {
  const posY1 = useRef(0);
  const posY2 = useRef(0);
  const accountDetailRef = useRef(document.createElement("div"));
  const logoutButtonRef = useRef(document.createElement("div"));
  const navbarContainerRef = useRef(document.createElement("nav"));
  const [userState, setUserState] = useState(userStore.currentState());
  const [isShowDropdown, setIsShowDropDown] = useState(false);
  const [isShowDropdown2, setIsShowDropDown2] = useState(false);
  const navbarSmallMobileContainerRef = useRef(document.createElement("i"));
  const [isHide, setIsHide] = useState(false);
  useInitStore(userStore, setUserState);
  useEffect(() => {
    const subscription = timer(0)
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api",
            method: "GET",
          }).pipe(
            debounceTime(500),
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v: any) => {
        if (v && !v.error) {
          const object = { ...v.user };
          userStore.updateState(object);
        }
      });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState.trigger]);
  useEffect(() => {
    userStore.updateState({
      isDarkMode: JSON.parse(
        window.localStorage.getItem("isDarkModeSVN") || "false"
      ),
    });
    const subscription = fromEvent(logoutButtonRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            method: "DELETE",
            url: "/api/user/logout",
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v) => {
        if (v && !v.error) {
          userStore.updateState({
            role: "",
            username: "",
            avatarImage: "/avatar.webp",
            createdAt: "",
            email: "",
            trigger: !userStore.currentState().trigger,
          });
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const subscription = fromEvent(accountDetailRef.current, "click").subscribe(
      () => {
        setIsShowDropDown(!isShowDropdown);
      }
    );
    const subscription2 = fromEvent(accountDetailRef.current, "mouseleave")
      .pipe(switchMap(() => fromEvent(window, "click")))
      .subscribe(() => {
        setIsShowDropDown(false);
      });

    return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowDropdown]);
  useEffect(() => {
    const subscription2 = fromEvent(window, "click").subscribe((e: any) => {
      if (e.target.className !== "fas fa-bars fa-2x") setIsShowDropDown2(false);
      else setIsShowDropDown2(true);
    });

    return () => {
      subscription2.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowDropdown2]);
  useEffect(() => {
    const subscription = fromEvent(window, "resize").subscribe(() => {
      if (window.innerWidth < 690) {
        setIsHide(true);
      } else {
        setIsHide(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [isHide]);
  useEffect(() => {
    if (window.innerWidth < 690) {
      setIsHide(true);
    }
    const subscription = fromEvent(window, "scroll").subscribe(() => {
      posY2.current = posY1.current - window.scrollY;
      if (posY1.current !== 0) {
        if (posY2.current > 2) {
          navbarContainerRef.current.className = "navbar-container";
        }

        if (posY2.current < -2 && window.scrollY > 50) {
          navbarContainerRef.current.className = "navbar-container hide";
          setIsShowDropDown2(false);
          setIsShowDropDown(false);
        }
      }
      posY1.current = window.scrollY;
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <nav className="navbar-container" ref={navbarContainerRef}>
      <ChangeAccountInfoForm />
      <ul className="navbar-wrapper">
        <li className="navbar-item">
          <NavLink className={"logo"} to="/">
            <img src="/logo.png" alt="" width={"60px"} height={"60px"} />
            <span
              style={{
                transform: "translateX(-12px)",
              }}
            >
              SugoiVisualNovel
            </span>
          </NavLink>
        </li>
        <div className="navbar-item">
          <div
            className="dark-mode-container"
            onClick={() => {
              userStore.updateState({
                isDarkMode: !userStore.currentState().isDarkMode,
              });
              window.localStorage.setItem(
                "isDarkModeSVN",
                JSON.stringify(userStore.currentState().isDarkMode)
              );
            }}
          >
            {!userState.isDarkMode && <span>🌜</span>}
            {userState.isDarkMode && <span>🌞</span>}
          </div>
          {!isHide && (
            <NavLink
              className="right-side-link"
              to="/About"
              style={{
                marginRight: "0.2rem",
              }}
            >
              About
            </NavLink>
          )}
          {userState.role === "" && !isHide && (
            <NavLink className="right-side-link" to="/login">
              Login
            </NavLink>
          )}
          <div
            className="right-side-link account-detail"
            style={{
              display: userState.role === "" ? "none" : "flex",
            }}
            ref={accountDetailRef}
          >
            <img src={userState.avatarImage} alt="" />
            <i className="fas fa-chevron-down"></i>
            <div
              className="drop-down-container"
              style={{
                display: isShowDropdown ? "block" : "none",
              }}
            >
              {userState.role === "Admin" && (
                <Link className="link-account-setting" to={"/admin"}>
                  Admin Manager
                </Link>
              )}
              <Link className="link-account-setting" to={"/account"}>
                Account Settings
              </Link>
              {(userState.role === "Admin" || userState.role === "Member") && (
                <Link className="link-account-setting" to={"/chat"}>
                  Secret Room
                </Link>
              )}
              <div ref={logoutButtonRef}>Logout</div>
              <a
                className="link-account-setting"
                href={"https://www.buymeacoffee.com/SugoiVN"}
                target={"_blank"}
                rel="noreferrer"
              >
                <span>Buy SVN a Coffee</span>
                <Donate />
              </a>
              <NavLink
                className="link-account-setting"
                to="/About"
                style={{
                  marginRight: "0.2rem",
                }}
              >
                About
              </NavLink>
            </div>
          </div>
          {userState.role === "" && !isHide && (
            <NavLink className="right-side-link" to="/register">
              Register
            </NavLink>
          )}
          {userState.role === "" && !isHide && (
            <a
              className="link-account-setting right-side-link"
              href={"https://www.buymeacoffee.com/SugoiVN"}
              target={"_blank"}
              rel="noreferrer"
            >
              <span>Buy SVN a Coffee</span>
              <Donate />
            </a>
          )}
          <div className="navbar-small-mobile-container">
            {isHide && userState.role === "" && (
              <i
                className="fas fa-bars fa-2x"
                ref={navbarSmallMobileContainerRef}
              ></i>
            )}
            {isHide && userState.role === "" && isShowDropdown2 && (
              <div className="navbar-small-mobile-wrapper">
                <NavLink className="right-side-link" to="/login">
                  Login
                </NavLink>
                <NavLink className="right-side-link" to="/register">
                  Register
                </NavLink>
                <a
                  className="link-account-setting right-side-link"
                  href={"https://www.buymeacoffee.com/SugoiVN"}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  <span style={{ whiteSpace: "nowrap" }}>Buy SVN a Coffee</span>
                  <Donate />
                </a>
                <NavLink
                  className="right-side-link"
                  to="/About"
                  style={{
                    marginRight: "0.2rem",
                  }}
                >
                  About
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
