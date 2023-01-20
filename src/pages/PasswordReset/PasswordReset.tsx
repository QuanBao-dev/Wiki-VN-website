import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  from,
  startWith,
  fromEvent,
  filter,
  combineAll,
  tap,
  exhaustMap,
  pluck,
  catchError,
  of,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import Input from "../../components/Input/Input";

import "./PasswordReset.css";
const PasswordReset = () => {
  const { token } = useParams();
  const formContainerRef = useRef(document.createElement("form"));
  const passwordRef = useRef(document.createElement("input"));
  const confirmedPasswordRef = useRef(document.createElement("input"));
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
            url: "/api/user/edit/reset/password",
            method: "Put",
            body: {
              password: passwordRef.current.value,
              confirmedPassword: confirmedPasswordRef.current.value,
            },
            headers: {
              authorization: `Bearer ${token}`,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((res: any) => {
        if (!res.error) {
          alert("Reset Password Successfully");
          navigate("/");
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
        <h1>Password Reset</h1>
        {errorMessage !== "" && (
          <div className="error-container">{errorMessage}</div>
        )}

        <Input
          label={"New Password"}
          type={"password"}
          inputRef={passwordRef}
        />
        <Input
          label={"Confirmed New Password"}
          type={"password"}
          inputRef={confirmedPasswordRef}
        />
        <button ref={buttonRef}>Submit</button>
      </form>
    </div>
  );
};

export default PasswordReset;
