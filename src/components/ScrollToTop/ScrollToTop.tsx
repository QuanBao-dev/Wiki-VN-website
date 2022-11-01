import { useEffect, useRef } from "react";
import { fromEvent } from "rxjs";
import "./ScrollToTop.css";
const ScrollToTop = () => {
  const posY1 = useRef(0);
  const posY2 = useRef(0);
  const scrollToTopRef = useRef(document.createElement("div"));
  useEffect(() => {
    const subscription = fromEvent(window, "scroll").subscribe(() => {
      if (window.scrollY === 0) {
        scrollToTopRef.current.style.transform = "translateY(100px)";
        return;
      }
      posY2.current = posY1.current - window.scrollY;
      if (posY1.current !== 0) {
        if (posY2.current < -2) {
          scrollToTopRef.current.style.transform = "translateY(100px)";
        }
        if (posY2.current > 2) {
          scrollToTopRef.current.style.transform = "translateY(0)";
        }
      }
      posY1.current = window.scrollY;
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <div
      className="scroll-to-top-container"
      ref={scrollToTopRef}
      onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
    >
      <i className="fas fa-arrow-up fa-2x"></i>
    </div>
  );
};

export default ScrollToTop;
