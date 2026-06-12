import React from 'react';
import { Plus, Edit3 } from 'lucide-react';
import './SidebarGrade.css'; 

export default function SidebarGrade({ 
  grades = [], 
  activeGradeId = null, 
  isAdmin = false, // Thêm prop này, mặc định là false (giao diện Học sinh)
  onAddGrade, 
  onEditGrade, 
  onGradeClick 
}) {
  return (
    <div className="portal-sidebar">
      <div className="sidebar-header">
        {/* Nếu là Admin hiển thị "Quản lý lớp", Học sinh hiển thị "Khối lớp" */}
        <h2 className="sidebar-title">{isAdmin ? "Quản lý lớp" : "Khối lớp"}</h2>
        
        {/* Chỉ hiển thị nút Thêm nếu là Admin */}
        {isAdmin && onAddGrade && (
          <button onClick={onAddGrade} className="btn-add-grade">
            <Plus size={14} /> Thêm
          </button>
        )}
      </div>

      {grades.length === 0 ? (
        <div className="sidebar-empty">Chưa có dữ liệu lớp</div>
      ) : (
        grades.map((g) => (
          <div
            key={g.grade_id}
            onClick={() => onGradeClick && onGradeClick(g.grade_id)}
            className={`sidebar-item ${Number(activeGradeId) === Number(g.grade_id) ? 'active' : ''}`}
          >
            <span className="sidebar-item-text">{g.grade_name}</span>
            
            {/* Chỉ hiển thị nút Sửa nếu là Admin */}
            {isAdmin && onEditGrade && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditGrade && onEditGrade(e, g);
                }}
                className="btn-edit-grade"
                title="Sửa tên lớp"
              >
                <Edit3 size={13} />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}