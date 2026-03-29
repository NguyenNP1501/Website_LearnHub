CREATE DATABASE IF NOT EXISTS elearning;
USE elearning;

-- USER
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role varchar(100)
);

-- STUDENT
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    school VARCHAR(100),
    grade_class VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- TEACHER
CREATE TABLE Teacher (
    teacher_id INT PRIMARY KEY,
    specialization VARCHAR(100),
    FOREIGN KEY (teacher_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- COURSE
CREATE TABLE Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255),
    subject VARCHAR(100),
    grade_class VARCHAR(50),
    description TEXT,
    teacher_id INT,
    img_url TEXT,
    FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id) ON DELETE SET NULL
);


-- LESSON
CREATE TABLE Lesson (
    lesson_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255),
    content TEXT,
    img_url TEXT,
    status VARCHAR(50),
    video_url TEXT,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

CREATE TABLE student_course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    status VARCHAR(50), -- not_started | learning | completed
    progress FLOAT DEFAULT 0, -- %
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,

    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE,

    UNIQUE (student_id, course_id) -- tránh đăng ký trùng
);

-- Student_lesson: theo dõi tiến độ học
CREATE TABLE student_lesson (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    lesson_id INT,
    status VARCHAR(50),
    watch_time INT DEFAULT 0,
    duration INT DEFAULT 0,
    progress INT DEFAULT 0,
    last_accessed DATETIME,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES Lesson(lesson_id) ON DELETE CASCADE
);

-- PRACTICE EXAM
CREATE TABLE PracticeExam (
    practice_exam_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255),
    time INT,
    subject VARCHAR(100),
    grade_class VARCHAR(50),
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

create table lesson_practiceexam(
	lesson_practiceexam_id int auto_increment primary key,
    lesson_id int,
    practice_exam_id int,
    foreign key (lesson_id) references Lesson(lesson_id),
    foreign key (practice_exam_id) references PracticeExam(practice_exam_id)
);

-- QUESTION
CREATE TABLE Question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT,
    type VARCHAR(50),
    subject VARCHAR(100),
    grade_class VARCHAR(50),
    difficulty VARCHAR(50),
    solution TEXT
);

-- ANSWER
CREATE TABLE Answer (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    answer_text TEXT,
    is_correct BOOLEAN,
    FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE
);

-- STUDENT_ANSWER (Câu trả lời của học sinh khi làm bài)
create table student_answer(
	student_answer_id int auto_increment primary key,
    student_id int,
    answer_id int,
    foreign key (student_id) references Student(student_id),
    foreign key (answer_id) references Answer(answer_id)
);

-- ATTEMPT
CREATE TABLE Attempt (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    practice_exam_id INT,
    score FLOAT,
    time INT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (practice_exam_id) REFERENCES PracticeExam(practice_exam_id) ON DELETE CASCADE
);

create table student_answer_attempt(
	student_answer_attempt_id int auto_increment primary key,
    student_answer_id int,
    attempt_id int,
    foreign key (student_answer_id) references  student_answer(student_answer_id),
    foreign key (attempt_id) references attempt(attempt_id)
);

-- POST
CREATE TABLE Post (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- COMMENT
CREATE TABLE Comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    post_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE
);

-- EXAM QUESTION (bảng trung gian nếu 1 đề có nhiều câu hỏi và 1 câu có thể thuộc nhiều đề)
CREATE TABLE ExamQuestion (
    exam_question_id INT AUTO_INCREMENT PRIMARY KEY,
    practice_exam_id INT,
    question_id INT,
    number_of_question INT,
    FOREIGN KEY (practice_exam_id) REFERENCES PracticeExam(practice_exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE
);