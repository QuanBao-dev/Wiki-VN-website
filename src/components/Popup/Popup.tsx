import "./Popup.css";

import { useEffect, useRef } from "react";

// import Donate from "../Donate/Donate";
import { fromEvent } from "rxjs";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  url: string;
  isHide: boolean;
  setIsHide: React.Dispatch<React.SetStateAction<boolean>>;
}
const Popup = ({ title, description, url, isHide, setIsHide }: Props) => {
  const popupWrapperRef = useRef(document.createElement("div"));
  useEffect(() => {
    if (!isHide) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isHide]);
  useEffect(() => {
    if (
      window.innerHeight <
      popupWrapperRef.current.getBoundingClientRect().height
    ) {
      popupWrapperRef.current.style.height = `${window.innerHeight}px`;
    }

    const subscription = fromEvent(window, "resize").subscribe(() => {
      if (
        window.innerHeight <
        popupWrapperRef.current.getBoundingClientRect().height
      ) {
        popupWrapperRef.current.style.height = `${window.innerHeight}px`;
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [isHide]);
  return (
    <div
      className="popup-container"
      style={{
        display: isHide ? "none" : "flex",
      }}
      onClick={(e) => {
        const target = e.target as any;
        if (target.className === "popup-container") {
          setIsHide(true);
        }
      }}
    >
      <div className="popup-wrapper" ref={popupWrapperRef}>
        <h1 className="popup-title">{title}</h1>
        <p className="popup-description">{description}</p>
        <div className="popup-buttons">
          {/* <a
            className="bmc-btn"
            href={"https://www.buymeacoffee.com/SugoiVN"}
            target={"_blank"}
            rel="noreferrer"
          >
            <Donate />
            <span className="bmc-btn-text">Buy me a Coffee</span>
          </a> */}
          <a
            title="Support me on ko-fi"
            className="kofi-button"
            target="_blank"
            href={"https://ko-fi.com/sugoivn"}
            rel="noreferrer"
          >
            <span className="kofitext">
              <img
                src="https://storage.ko-fi.com/cdn/cup-border.png"
                alt="Ko-fi donations"
                className="kofiimg"
              />
              Buy me a coffee
            </span>
          </a>
          <a
            title="Support me on patreon"
            className="patreon-button"
            target="_blank"
            href={"https://www.patreon.com/SugoiVN"}
            rel="noreferrer"
          >
            <span className="patreon-text">Patreon</span>
          </a>
          {title !== "Early Access!" && (
            <a
              className="button-link-download"
              href={url}
              target={"_blank"}
              rel="noreferrer"
              onClick={(e) => {
                setIsHide(true);
              }}
            >
              <span>Continue</span>
            </a>
          )}
          {title === "Early Access!" && (
            <Link
              className="button-link-login"
              to={"/login"}
              rel="noreferrer"
              onClick={() => {
                setIsHide(true);
              }}
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
