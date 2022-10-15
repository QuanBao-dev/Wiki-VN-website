import './Register.css';

import { useEffect, useRef } from 'react';
import { fromEvent, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, pluck, switchMap } from 'rxjs/operators';

const Register = () => {
  const emailRef = useRef(document.createElement("input"));
  const usernameRef = useRef(document.createElement("input"));
  const passwordRef = useRef(document.createElement("input"));
  const buttonRef = useRef(document.createElement("button"));
  useEffect(() => {
    const subscription = fromEvent(buttonRef.current, "click")
      .pipe(
        switchMap(() =>
          ajax({
            url: "/api/user/register",
            method: "POST",
            body: {
              username: usernameRef.current.value,
              password: passwordRef.current.value,
              email: emailRef.current.value,
            },
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error))
          )
        )
      )
      .subscribe((res) => {
        if (!res.error) {
          alert(res.message);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <div className="form-container">
      <label htmlFor="">Username</label>
      <input type="text" ref={usernameRef} />
      <label htmlFor="">Email</label>
      <input type="text" ref={emailRef} />
      <label htmlFor="">Password</label>
      <input type="text" ref={passwordRef} />
      <button ref={buttonRef}>Submit</button>
    </div>
  );
};

export default Register;
