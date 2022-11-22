import './Register.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { from, fromEvent, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, combineAll, exhaustMap, filter, pluck, startWith, tap } from 'rxjs/operators';

import Input from '../../components/Input/Input';

const Register = () => {
  const emailRef = useRef(document.createElement("input"));
  const usernameRef = useRef(document.createElement("input"));
  const passwordRef = useRef(document.createElement("input"));
  const formContainerRef = useRef(document.createElement("form"));
  const buttonRef = useRef(document.createElement("button"));
  const [errorMessage, setErrorMessage] = useState("");
  const confirmedPasswordRef = useRef(document.createElement("input"));
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
            url: "/api/user/register",
            method: "POST",
            body: {
              username: usernameRef.current.value,
              password: passwordRef.current.value,
              email: emailRef.current.value,
              confirmedPassword: confirmedPasswordRef.current.value
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((res: any) => {
        if (!res.error) {
          alert(res);
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
      <form className="form-container" ref={formContainerRef}>
        <h1>Register</h1>
        {errorMessage !== "" && (
          <div className="error-container">{errorMessage}</div>
        )}
        <Input label={"username"} type={"text"} inputRef={usernameRef} />
        <Input label={"email"} type={"text"} inputRef={emailRef} />
        <Input label={"password"} type={"password"} inputRef={passwordRef} />
        <Input
          label={"Confirmed Password"}
          type={"password"}
          inputRef={confirmedPasswordRef}
        />
        <button ref={buttonRef}>Submit</button>
      </form>
    </div>
  );
};

export default Register;
