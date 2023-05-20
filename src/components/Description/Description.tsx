import { useEffect, useRef } from "react";
import "./Description.css";
import { parseDescription } from "../../util/parseDescription";

const Description = ({ description }: { description: string }) => {
  const descriptionRef = useRef(document.createElement("div"));
  useEffect(() => {
    descriptionRef.current.innerHTML = parseDescription(description);
  }, [description]);
  return <div ref={descriptionRef}></div>;
};

export default Description;
