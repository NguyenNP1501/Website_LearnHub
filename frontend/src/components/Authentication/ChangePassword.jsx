import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./styles.css";

function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tokenStatus, setTokenStatus] = useState(token ? "checking" : "invalid");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/authentication/reset-password?token=${token}`,
        );

        if (isMounted) {
          setTokenStatus(response.data.valid ? "valid" : "invalid");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        if (isMounted) {
          setTokenStatus("invalid");
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/authentication/reset-password",
        {
          username: data.username,
          token,
          newPassword: data.newPassword,
        },
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <div>
      <h2>Đổi mật khẩu</h2>
      {tokenStatus === "checking" && <p>Đang xác minh liên kết đổi mật khẩu...</p>}
      {tokenStatus === "invalid" && (
        <p className="error">Liên kết đổi mật khẩu không hợp lệ hoặc đã hết hạn.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={tokenStatus !== "valid"} style={{ border: 0, margin: 0, padding: 0 }}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            {...register("username", { required: true })}
          />
          {errors.username && <span className="error">Vui lòng nhập tên đăng nhập</span>}

          <br />

          <input
            type="password"
            placeholder="Mật khẩu mới"
            {...register("newPassword", { required: true, minLength: 6 })}
          />
          {errors.newPassword && (
            <span className="error">Mật khẩu mới phải có ít nhất 6 ký tự</span>
          )}

          <br />

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            {...register("confirmPassword", {
              required: true,
              validate: (value) => value === getValues("newPassword"),
            })}
          />
          {errors.confirmPassword && (
            <span className="error">Mật khẩu xác nhận không khớp</span>
          )}

          <br />

          <button type="submit">Đổi mật khẩu</button>
        </fieldset>
      </form>
    </div>
  );
}

export default ChangePassword;
