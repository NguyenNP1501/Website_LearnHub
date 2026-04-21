import React, { useState } from 'react';
import { User, Mail, Lock, Building, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  // 1. Quản lý toàn bộ State (Dữ liệu người dùng nhập)
  const [role, setRole] = useState('Giáo viên');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State dành riêng cho Học sinh
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  
  // State dành riêng cho Giáo viên
  const [major, setMajor] = useState('');

  // State thông báo lỗi/thành công
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 2. Hàm xử lý khi bấm nút Đăng ký
  const handleRegister = async (e) => {
    e.preventDefault(); // Ngăn trang bị reload lại
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
      school: role === 'Học sinh' ? school : null,
      class_name: role === 'Học sinh' ? className : null,
      major: role === 'Giáo viên' ? major : null
    };

    try {
      // 3. Bắn dữ liệu sang API Backend
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      
      // Nếu thành công
      setMessage(response.data.message);
      setIsError(false);
      
      // Đợi 2 giây rồi tự động chuyển hướng sang trang Đăng nhập
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      // Nếu Backend báo lỗi (ví dụ: Trùng email)
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

        {/* Hiển thị thông báo Lỗi hoặc Thành công */}
        {message && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '5px', 
            textAlign: 'center',
            backgroundColor: isError ? '#fee2e2' : '#dcfce7',
            color: isError ? '#dc2626' : '#166534',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {/* Chú ý: Đã thêm onSubmit vào thẻ form */}
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
              <option value="Giáo viên">Giáo viên</option>
              <option value="Học sinh">Học sinh</option>
            </select>
          </div>

          {role === 'Học sinh' && (
            <div className="form-row">
              <div className="form-group half-width">
                <label>Trường học</label>
                <div className="input-with-icon gray-bg">
                  <Building className="input-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder="Tên trường" 
                    className="gray-input"
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
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
            </div>
          )}

          {role === 'Giáo viên' && (
            <div className="form-group">
              <label>Chuyên ngành / Môn giảng dạy</label>
              <div className="input-with-icon gray-bg">
                <BookOpen className="input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Nhập chuyên môn của bạn" 
                  className="gray-input"
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
                type="password" 
                placeholder="Nhập mật khẩu" 
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="Nhập lại mật khẩu" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
          <p>Bạn đã có tài khoản? <a href="/login" className="blue-link">Đăng nhập</a></p>
        </div>

      </div>
    </div>
  );
}