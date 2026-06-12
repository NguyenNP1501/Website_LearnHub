import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Building, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  // State quản lý UI bật/tắt mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Trạng thái thông báo
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // <--- Thêm State quản lý Modal Lỗi

  // Khởi tạo useForm (Cố định role ban đầu là student)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'student'
    }
  });

  // Sử dụng watch để theo dõi ô mật khẩu nhằm validate ô "Xác nhận mật khẩu"
  const password = watch('password');

  // Hàm xử lý khi form hợp lệ và được bấm Submit
  const onSubmit = async (data) => {
    setMessage('');

    try {
      // Gửi dữ liệu đăng ký lên Server Backend
      const response = await axios.post('http://localhost:3000/api/auth/register', data);
      
      // Mở Modal Thành công
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/login');
      }, 2500);

    } catch (error) {
      // Nếu có lỗi, lấy message từ Backend hoặc gán câu thông báo mặc định
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Hệ thống đang bận hoặc lỗi kết nối đến máy chủ!');
      }
      
      // Kích hoạt Modal Lỗi hiển thị lên màn hình giống Modal Thành công
      setShowErrorModal(true);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-card">
        
        <div className="register-header">
          <h2 className="register-title">Tạo tài khoản</h2>
          <p className="register-subtitle">Tham gia LearnHub bằng cách tạo tài khoản mới</p>
        </div>

        {/* Bọc hàm xử lý qua handleSubmit của useForm */}
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Họ và tên */}
          <div className="form-group">
            <label>Họ và tên</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="Nhập họ và tên" 
                {...register('full_name', { required: 'Vui lòng nhập họ và tên!' })}
              />
            </div>
            {errors.full_name && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.full_name.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                {...register('email', { 
                  required: 'Vui lòng nhập email!',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email không đúng định dạng!' }
                })}
              />
            </div>
            {errors.email && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</span>}
          </div>

          {/* Vai trò tĩnh */}
          <div className="form-group">
            <label>Vai trò</label>
            <div className="input-with-icon gray-bg">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                value="Học sinh" 
                readOnly 
                className="gray-input"
                style={{ cursor: 'not-allowed', color: '#64748b', fontWeight: '500' }}
              />
            </div>
          </div>

          {/* Trường học & Lớp học */}
          <div className="form-row">
            <div className="form-group half-width">
              <label>Trường học</label>
              <div className="input-with-icon">
                <Building className="input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Tên trường" 
                  className="input"
                  {...register('school', { required: 'Vui lòng nhập tên trường!' })}
                />
              </div>
              {errors.school && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.school.message}</span>}
            </div>

            <div className="form-group half-width">
              <label>Lớp học</label>
              <input 
                type="text" 
                placeholder="Tên lớp" 
                className="input no-icon"
                {...register('class_name', { required: 'Vui lòng nhập tên lớp!' })}
              />
              {errors.class_name && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.class_name.message}</span>}
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                {...register('password', { 
                  required: 'Vui lòng nhập mật khẩu!', 
                  minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' } 
                })}
              />
              <span 
                className="eye-toggle-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '35%', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.password && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</span>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Nhập lại mật khẩu" 
                {...register('confirmPassword', { 
                  required: 'Vui lòng xác nhận lại mật khẩu!',
                  validate: value => value === password || 'Mật khẩu xác nhận không khớp!'
                })}
              />
              <span 
                className="eye-toggle-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '35%', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword.message}</span>}
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              Tôi đồng ý với các <a href="#" className="blue-link">Điều khoản & Điều kiện</a>
            </label>
          </div>

          <button type="submit" className="btn-register">Đăng ký</button>
        </form>

        <div className="register-footer">
          <p>Bạn đã có tài khoản? <Link to="/login" className="blue-link">Đăng nhập</Link></p>
        </div>

      </div>

      {/* ==================== MODAL POPUP ĐĂNG KÝ THÀNH CÔNG ==================== */}
      {showSuccessModal && (
        <div className="reg-success-overlay">
          <div className="reg-success-card">
            <div className="reg-success-icon-wrapper">
              <CheckCircle2 className="reg-success-icon" size={56} />
            </div>
            <h3 className="reg-success-title">Đăng ký thành công!</h3>
            <p className="reg-success-desc">
              Tài khoản của bạn đã được khởi tạo trên nền tảng <strong>LearnHub</strong>.
            </p>
            <div className="reg-redirect-status">
              Đang chuyển hướng sang trang đăng nhập...
            </div>
            <div className="reg-loading-bar-bg">
              <div className="reg-loading-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL POPUP ĐĂNG KÝ THẤT BẠI (MỚI) ==================== */}
      {showErrorModal && (
        <div className="reg-success-overlay">
          <div className="reg-success-card reg-error-card">
            <div className="reg-error-icon-wrapper">
              <XCircle className="reg-error-icon" size={56} />
            </div>
            <h3 className="reg-error-title">Đăng ký thất bại</h3>
            <p className="reg-error-desc">
              {message || "Đã xảy ra sai sót trong quá trình tạo tài khoản."}
            </p>
            
            <button 
              type="button" 
              className="btn-error-close" 
              onClick={() => setShowErrorModal(false)}
            >
              Thử lại ngay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}