import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";
const NotFound = () => {
  let [counter, setCounter] = useState(3);
  const navigate = useNavigate();
  useEffect(() => {
    if (counter === 0) navigate("/");
    const interval = setInterval(() => {
      if (counter > 0) setCounter(--counter);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);
  return (
    <div
      className="not-found-container"
      style={{
        backgroundImage: `url("${window.location.origin}/error.jpg")`,
      }}
    >
      <img src="/404.png" alt="" />
      <h1>Page Not Found</h1>
      <h1>{counter}</h1>
    </div>
  );
};

export default NotFound;
