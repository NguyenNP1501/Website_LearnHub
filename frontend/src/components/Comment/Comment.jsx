import { useState, useEffect } from "react"
import axios from "axios";
import { useForm } from "react-hook-form";
import './styles.css';
import ListComments from "./listComments";

function Comment({post_id}){
    const {register, watch, formState: {errors, isSubmitting}, handleSubmit, reset} = useForm();
    const [refreshComment, setReFreshComment] = useState(0);

    const onSubmit = async (data) => {
        try{
            if(!data.content.trim()) return; // Tránh trường hợp người dùng chỉ nhập dấu cách mà không có nội dung thực sự

            const formData = new FormData();

            formData.append('post_id', post_id);
            formData.append('content', data.content);
            formData.append('folderType', 'Comment');

            // Append image files if any
            if (data.imageUrl && data.imageUrl.length > 0) {
                Array.from(data.imageUrl).forEach((file) => {
                    formData.append('files', file); 
                });
            }

            const response = await axios.post('http://localhost:3000/api/comment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setReFreshComment(prev => prev + 1);
            reset();
            if(response.status === 201) {
                console.log('Bình luận đã được tạo thành công!');
            }
        }
        catch(err){
            console.error("Error: " + err);
            console.log("Bình luận thất bại");
        }
    }

    return (
        <div className="comment-wrapper">
            <div className="comments-list">
                <ListComments post_id={post_id} refreshTrigger={refreshComment}/>
            </div>

            <form className="comment-input" onSubmit={handleSubmit(onSubmit)}>
                <textarea {...register('content', {required: "Vui lòng nhập nội dung bình luận"})} placeholder="Viết bình luận" onKeyDown={(e) => {
                    if(e.isComposing || e.keyCode === 229) return; // Sửa lỗi bộ gõ tiếng Việt trùng phím Enter
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                    }
                }}/>
                {errors.content && <p className="comment-error">{errors.content.message}</p>}

                <input 
                    id="imageUrl" 
                    type='file' 
                    accept='image/*' 
                    multiple
                    {...register('imageUrl')} 
                />
            </form>
        </div>
    );
}

export default Comment;