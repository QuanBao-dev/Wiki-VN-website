import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { fromEvent } from "rxjs";
import "./NavBar.css";
const NavBar = () => {
  const posY1 = useRef(0);
  const posY2 = useRef(0);
  const navbarContainerRef = useRef(document.createElement("nav"));
  useEffect(() => {
    const subscription = fromEvent(window, "scroll").subscribe(() => {
      posY2.current = posY1.current - window.scrollY;
      if (posY1.current !== 0) {
        if (posY2.current > 2) {
          navbarContainerRef.current.className = "navbar-container";
        }

        if (posY2.current < -2 && window.scrollY > 50) {
          navbarContainerRef.current.className = "navbar-container hide";
        }
      }
      posY1.current = window.scrollY;
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <nav className="navbar-container" ref={navbarContainerRef}>
      <ul className="navbar-wrapper">
        <li className="navbar-item">
          <NavLink className={"logo"} to="/">
            <img src="/logo.png" alt="" width={"60px"} height={"60px"} />
            <span
              style={{
                transform: "translateX(-12px)",
              }}
            >
              SugoiVisualNovels
            </span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
