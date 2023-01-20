import './UserLostPassword.css';

import { useEffect, useRef, useState } from 'react';
import { catchError, combineAll, exhaustMap, filter, from, fromEvent, of, pluck, startWith, tap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

import Input from '../../components/Input/Input';

const UserLostPassword = () => {
  const formContainerRef = useRef(document.createElement("form"));
  const emailRef = useRef(document.createElement("input"));
  const buttonRef = useRef(document.createElement("button"));
  const [errorMessage, setErrorMessage] = useState("");
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
            url: "/api/user/reset/password",
            method: "Put",
            body: {
              email: emailRef.current.value,
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
        <h1>Forgot your password</h1>
        {errorMessage !== "" && (
          <div className="error-container">{errorMessage}</div>
        )}

        <Input label={"Email"} type={"text"} inputRef={emailRef} />

        <button ref={buttonRef}>Submit</button>
      </form>
    </div>
  );
};

export default UserLostPassword;
