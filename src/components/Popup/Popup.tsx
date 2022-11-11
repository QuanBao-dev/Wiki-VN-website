import { useEffect } from "react";
import Donate from "../Donate/Donate";
import "./Popup.css";
interface Props {
  title: string;
  description: string;
  url: string;
  isHide: boolean;
  setIsHide: React.Dispatch<React.SetStateAction<boolean>>;
}
const Popup = ({ title, description, url, isHide, setIsHide }: Props) => {
  useEffect(() => {
    if (!isHide) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isHide]);
  return (
    <div
      className="popup-container"
      style={{
        display: isHide ? "none" : "flex",
      }}
    >
      <div className="popup-wrapper">
        <h1 className="popup-title">{title}</h1>
        <p className="popup-description">{description}</p>
        <div className="popup-buttons">
          <a
            className="button-link-donate"
            href={"https://www.buymeacoffee.com/SugoiVN"}
            target={"_blank"}
            rel="noreferrer"
          >
            <span>Buy SVN a Coffee</span>
            <Donate />
          </a>
          <a
            className="button-link-download"
            href={url}
            target={"_blank"}
            rel="noreferrer"
            onClick={(e) => {
              setIsHide(true);
            }}      
          >
            <span>Close</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Popup;
