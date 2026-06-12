import { useForm } from "react-hook-form";
import axios from "axios";
import "./styles.css";

function SendToken() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/authentication/handle-token",
        { email: data.email },
      );

      if (response.status === 200) {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
        />
        {errors.email && <span className="error">Email là bắt buộc</span>}

        <br />

        <button type="submit">Gửi yêu cầu</button>
      </form>
    </div>
  );
}

export default SendToken;
