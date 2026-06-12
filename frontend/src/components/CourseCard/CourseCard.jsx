import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import './CourseCard.css';

export default function CourseCard({ course, isAdmin = false, canEdit = true, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="course-card">
      {/* Ảnh bìa khóa học */}
      <div
        className="thumbnail"
        style={{
          backgroundColor: course.color,
          backgroundImage: course.img_url ? `url(${course.img_url})` : 'none',
        }}
      ></div>

      {/* Tên khóa học */}
      <h3 className="course-title">{course.title}</h3>

      {/* RENDER NÚT THEO QUYỀN */}
      {isAdmin ? (
        <div className="admin-actions">
          {/* Hàng trên: Xem & Sửa nằm song song để tối ưu không gian */}
          <div className="action-row-top">
            <button 
              className="btn-view" 
              onClick={() => navigate(`/admin/course/${course.id}`)}
            >
              <Eye size={16} /> Xem
            </button>

            {canEdit && (
              <button 
                className="btn-edit" 
                onClick={() => onEdit(course.id)}
              >
                <Edit size={16} /> Sửa
              </button>
            )}
          </div>
          
          {/* Hàng dưới: Nút Xóa chiếm trọn chiều ngang tạo bố cục vững chãi */}
          {canEdit && (
            <button 
              className="btn-delete" 
              onClick={() => onDelete(course.id)}
            >
              <Trash2 size={16} /> Xóa
            </button>
          )}
        </div>
      ) : (
        /* GIAO DIỆN DÀNH CHO HỌC SINH */
        <button
          className="btn-student-join"
          onClick={() => navigate(`/course/${course.id}`)} 
        >
          Vào học ngay
        </button>
      )}
    </div>
  );
}