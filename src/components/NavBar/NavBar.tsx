import { NavLink } from "react-router-dom";
import "./NavBar.css";
const NavBar = () => {
  return (
    <nav className="navbar-container">
      <ul className="navbar-wrapper">
        <li className="navbar-item">
          <NavLink className={"logo"} to="/">
            <img src="/sugoi.png" alt="" width={"60px"} height={"60px"} />
            <span style={{
              transform:"translateX(-12px)"
            }} >SugoiVisualNovels</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
