import React, { useState } from 'react';
import { User, Mail, Lock, Building, BookOpen, Eye, EyeOff, CheckCircle2 } from 'lucide-react'; // ĐÃ THÊM: CheckCircle2
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  // 1. Quản lý toàn bộ State
  const [role, setRole] = useState('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State dành riêng cho Học sinh
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  
  // State dành riêng cho Giáo viên
  const [major, setMajor] = useState('');

  // State hỗ trợ ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State thông báo lỗi/thành công thông thường
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // ĐÃ THÊM: State quản lý bật/tắt Modal thông báo thành công xịn xò
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 2. Hàm xử lý khi bấm nút Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault(); 
    setMessage('');
    setIsError(false);

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Đóng gói dữ liệu chuẩn bị gửi đi
    const userData = {
      full_name: fullName,
      email: email,
      password: password,
      role: role, 
      school: role === 'student' ? school : null,
      class_name: role === 'student' ? className : null,
      major: role === 'teacher' ? major : null
    };

    try {
      // 3. Bắn dữ liệu sang API Backend
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      
      // ĐÃ SỬA: Kích hoạt hiện Modal thông báo thành công hoành tráng
      setIsError(false);
      setShowSuccessModal(true);
      
      // Đợi 2.5 giây để người dùng trải nghiệm hiệu ứng và tự động chuyển sang đăng nhập
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/login');
      }, 2500);

    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Lỗi kết nối đến máy chủ!');
      }
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-card">
        
        <div className="register-header">
          <h2 className="register-title">Tạo tài khoản</h2>
          <p className="register-subtitle">Tham gia LearnHub bằng cách tạo tài khoản mới</p>
        </div>

        {/* Hiển thị thông báo Lỗi thông thường */}
        {message && isError && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '5px', 
            textAlign: 'center',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Họ và tên</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="Nhập họ và tên" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="email@gmail.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Vai trò</label>
            <select 
              className="role-select" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="teacher">Giáo viên</option>
              <option value="student">Học sinh</option>
            </select>
          </div>

          {role === 'student' && (
            <div className="form-row">
              <div className="form-group half-width">
                <label>Trường học</label>
                <div className="input-with-icon gray-bg">
                  <Building className="input-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Tên trường" 
                    className="gray-input"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group half-width">
                <label>Lớp học</label>
                <input 
                  type="text" 
                  placeholder="Tên lớp" 
                  className="gray-input no-icon"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
            </div>
          )}

          {role === 'teacher' && (
            <div className="form-group">
              <label>Chuyên ngành / Môn giảng dạy</label>
              <div className="input-with-icon gray-bg">
                <BookOpen className="input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Nhập chuyên môn của bạn" 
                  className="gray-input"
                  required
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span 
                className="eye-toggle-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '35%', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Nhập lại mật khẩu" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span 
                className="eye-toggle-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '35%', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
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

      {/* ======================================================= */}
      {/* ĐÃ THÊM: GIAO DIỆN MODAL POPUP ĐĂNG KÝ THÀNH CÔNG XỊN XÒ */}
      {/* ======================================================= */}
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
            {/* Thanh loading bar chạy lùi/tiến trực quan */}
            <div className="reg-loading-bar-bg">
              <div className="reg-loading-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}