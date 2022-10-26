import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { catchError, of } from "rxjs";
import { ajax } from "rxjs/ajax";

const Verify = () => {
  const { token } = useParams();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const subscription = ajax({
      url: "/api/verify/" + token,
      method: "GET",
    })
      .pipe(catchError((error) => of({ error })))
      .subscribe((res: any) => {
        if (!res.error) {
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
        }
        setTimeout(() => {
          navigate("/login")
        },2000)
      });
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return (
    <div>
      {isSuccess === true && <img src="/check.png" alt="" />}
      {isSuccess === false && <img src="/X mark.png" alt="" />}
    </div>
  );
};

export default Verify;
