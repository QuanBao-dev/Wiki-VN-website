import "./Login.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { from, fromEvent, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  catchError,
  combineAll,
  exhaustMap,
  filter,
  pluck,
  startWith,
  tap,
} from "rxjs/operators";

import Input from "../../components/Input/Input";
import { userStore } from "../../store/user";

const Login = () => {
  const emailRef = useRef(document.createElement("input"));
  const passwordRef = useRef(document.createElement("input"));
  const formContainerRef = useRef(document.createElement("form"));
  const buttonRef = useRef(document.createElement("button"));
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const subscription = from([
      fromEvent(buttonRef.current, "click").pipe(startWith("")),
      fromEvent(formContainerRef.current, "keydown").pipe(
        startWith(""),
        filter((e) => e === "" || (e as any).key === "Enter")
      ),
    ])
      .pipe(
        combineAll(),
        tap(([eventClick, eventKeyDown]) => {
          if (typeof eventClick !== "string") eventClick.preventDefault();
          if (typeof eventKeyDown !== "string") eventKeyDown.preventDefault();
          setErrorMessage("");
        }),
        filter(
          ([eventClick, eventKeyDown]) =>
            eventClick !== "" || eventKeyDown !== ""
        ),
        exhaustMap(() =>
          ajax({
            url: "/api/user/login",
            method: "POST",
            body: {
              email: emailRef.current.value,
              password: passwordRef.current.value,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((res: any) => {
        if (!res.error) {
          navigate("/");
          userStore.updateState({
            trigger: !userStore.currentState().trigger,
          });
        } else {
          setErrorMessage(res.error);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="auth-container">
      <form
        className="form-container"
        ref={formContainerRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <h1>Login</h1>
        {errorMessage !== "" && (
          <div className="error-container">{errorMessage}</div>
        )}
        <Input label={"email"} type={"text"} inputRef={emailRef} />
        <Input label={"password"} type={"password"} inputRef={passwordRef} />
        <div className="buttons-container">
          <Link to={"/lostPassword"}>Forgot your Password</Link>
          <button ref={buttonRef}>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
