import {useForm} from "react-hook-form";
import axios from "axios";
import {useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import './styles.css';

function ChangePassword() {
    const {register, handleSubmit, formState: {errors}, watch} = useForm();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/authentication/reset-password?token=${token}`);
                if (response.data.valid) {
                    setIsTokenValid(true); // Token hợp lệ
                }
            }
            catch (err) {
                console.error("Error verifying token: " + err);
                setIsTokenValid(false); // Token không hợp lệ hoặc đã hết hạn
            }
        }

        if (token) {
            verifyToken();
        }
        else {
            setIsTokenValid(false); // Không có token nào được cung cấp
        }
    }, [token]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://localhost:3000/api/authentication/reset-password', {
                username: data.username,
                token: token,
                newPassword: data.newPassword
            });
            
            if (response.status === 200) {
                console.log(response.data.message);
                navigate('/login'); // Chuyển hướng về trang đăng nhập sau khi đổi mật khẩu thành công
            }
        }
        catch (err) {
            console.error("Error changing password: " + err);
        }
    }

    return (
        <div>
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="username" placeholder="Tên đăng nhập" {...register("username", {required: true})} />
                {errors.username && <span className="error">Vui lòng nhập tên đăng nhập</span>}

                <br />

                <input type="password" placeholder="Mật khẩu mới" {...register("newPassword", {required: true, minLength: 6})} />
                {errors.newPassword && <span className="error">Mật khẩu mới phải có ít nhất 6 ký tự</span>}

                <br />

                <input type="password" placeholder="Xác nhận mật khẩu" {...register("confirmPassword", {required: true, validate: (value) => value === watch('newPassword')})}/>
                {errors.confirmPassword && <span className="error">Mật khẩu xác nhận không khớp</span>}

                <br />

                <button type="submit">Đổi mật khẩu</button>
            </form>
        </div>
    );
}

export default ChangePassword;