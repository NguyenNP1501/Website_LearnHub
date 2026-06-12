const CourseModel = require('../../models/KhoaHoc/CourseModel'); 
const ProgressModel = require('../../models/KhoaHoc/ProgressModel');

const getUrl = (file) => {
  if (!file) return null;
  return `http://localhost:3000/${file.path.replace(/\\/g, '/')}`;
};

const clientCourseController = {
  // API 1: LẤY DANH SÁCH KHÓA HỌC THEO LỚP & MÔN
  getAllCourses: async (req, res) => {
    try {
      const requestedGradeId = req.query.grade_id || req.query.grade;
      const requestedSubjectId = req.query.subject_id || req.query.subject || 'all'; 

      if (!requestedGradeId) {
        return res.status(400).json({ success: false, message: "Lỗi: Thiếu tham số ID khối lớp!" });
      }

      const rows = await CourseModel.findByGrade(requestedGradeId, requestedSubjectId);

      const formattedCourses = rows.map((courseItem) => {
        return {
          id: courseItem.id || courseItem.course_id,
          title: courseItem.title || courseItem.course_name, 
          subject_id: courseItem.subject_id, 
          grade_id: courseItem.grade_id,     
          img_url: courseItem.img_url,
          teacher_id: courseItem.teacher_id,
          teacher_name: courseItem.teacher_name 
        };
      });
      
      res.json(formattedCourses);
    } catch (error) {
      console.error("Lỗi Database tại Client getAllCourses:", error);
      res.status(500).json({ success: false, message: "Lỗi kết nối CSDL!" });
    }
  },
  // API 2: LẤY CHI TIẾT KHÓA HỌC + KIỂM TRA ĐĂNG KÝ + LẤY TIẾN ĐỘ THỰC TẾ
  getCourseDetail: async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentId = req.user?.id || req.user?.user_id || 1; 

      // 1. Lấy thông tin cơ bản khóa học
      const courseInfoRows = await CourseModel.findById(courseId);
      if (courseInfoRows.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy khóa học này!" });
      }
      const course = courseInfoRows[0];

      // 2. Lấy toàn bộ danh sách bài học thuộc khóa học
      const lessonRows = await CourseModel.findLessonsByCourseId(courseId);

      // 3. Tích hợp kiểm tra trạng thái đăng ký học tập của học viên
      const enrollment = await ProgressModel.checkEnrollment(studentId, courseId);
      const isEnrolled = !!enrollment; 

      // TỰ ĐỘNG CẬP NHẬT TIẾN ĐỘ THEO SỐ LƯỢNG BÀI HỌC MỚI NHẤT
      let realProgress = 0;
      if (isEnrolled) {
         await ProgressModel.calculateAndUpdateCourseProgress(studentId, courseId);

         const progressData = await ProgressModel.getCourseProgress(studentId, courseId);
         realProgress = progressData ? progressData.progress : 0;
      }

      // 4. Gom nhóm bài học theo tên chương mục (Chapter)
      const chaptersMap = {};
      lessonRows.forEach(lesson => {
        const chapterName = lesson.chapter || "Chương học tổng quan";
        if (!chaptersMap[chapterName]) {
          chaptersMap[chapterName] = {
            id: chapterName,
            chapter_id: chapterName, 
            title: chapterName,
            chapter_name: chapterName,
            lessons: []
          };
        }
        
        chaptersMap[chapterName].lessons.push({
          id: lesson.lesson_id,
          lesson_id: lesson.lesson_id, 
          title: lesson.title,
          lesson_name: lesson.title,  
          progress: 0,
          thumbnail: lesson.img_url,
          img_url: lesson.img_url,
          video_url: lesson.video_url
        });
      });

      const formattedChapters = Object.values(chaptersMap);

      const responseData = {
        success: true,
        isEnrolled: isEnrolled, 
        progress: realProgress, 
        info: {
          id: course.course_id || course.id,
          course_id: course.course_id || course.id,
          title: course.course_name || course.title,
          course_name: course.course_name || course.title,
          teacher: course.teacher_name,
          teacher_name: course.teacher_name,
          teacher_id: course.teacher_id, 
          subject_id: course.subject_id,    
          grade_id: course.grade_id,        
          description: course.description,   
          img_url: course.img_url,          
          totalLessons: lessonRows.length
        },
        chapters: formattedChapters
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết khóa học:", error);
      res.status(500).json({ success: false, message: "Lỗi kết nối hệ thống dữ liệu!" });
    }
  },
  
  // API 3: KIỂM TRA TRẠNG THÁI ĐĂNG KÝ
  checkStatus: async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentId = req.auth?.id || req.auth?.user_id || req.auth?.userId;
      const enrollment = await ProgressModel.checkEnrollment(studentId, courseId);
      res.status(200).json({ success: true, isEnrolled: !!enrollment, data: enrollment });
    } catch (error) {
      console.error("Lỗi API checkStatus:", error);
      res.status(500).json({ success: false, message: "Lỗi kiểm tra trạng thái đăng ký!" });
    }
  },

  // API 4: ĐĂNG KÝ KHÓA HỌC MỚI
  enroll: async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentId = req.auth?.id || req.auth?.user_id || req.auth?.userId;
      
      const enrollmentId = await ProgressModel.enrollCourse(studentId, courseId);
      
      res.status(200).json({ 
        success: true, 
        message: "Đăng ký tham gia khóa học thành công!",
        enrollmentId: enrollmentId 
      });
    } catch (error) {
      console.error("Lỗi API enroll phía Server:", error);
      res.status(500).json({ success: false, message: "Lỗi hệ thống, đăng ký khóa học thất bại!" });
    }
  },

  // API 5: LẤY TRỰC TIẾP TIẾN ĐỘ THEO YÊU CẦU
  getCourseProgress: async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user?.id || req.user?.user_id || 1;
        const data = await ProgressModel.getCourseProgress(studentId, courseId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy tiến độ" });
    }
  }
};

module.exports = clientCourseController;