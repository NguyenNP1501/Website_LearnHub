const CourseModel = require("../models/KhoaHoc/CourseModel");

exports.getLatestCourse = async (req, res, next) =>{
    try{
        const latestCourseList = await CourseModel.getLatestCourse();
        if(!latestCourseList){
            res.status(404).json({
                message: "Không tìm thấy khoá học",
            })
        }
        res.status(200).json(latestCourseList);
    }catch(error){
        next(error);
    }
}
