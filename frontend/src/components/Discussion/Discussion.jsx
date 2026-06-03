import { useEffect, useState } from 'react';
import './styles.css';
import axios from 'axios';
import {useForm} from 'react-hook-form';
import { use } from 'react';

function Discussion() {
    const { register, handleSubmit, reset, watch, formState: {errors} } = useForm();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const onSubmit = async (data) => {
    try {
            const formData = new FormData();

            formData.append('title', data.title);
            
            formData.append('content', data.content);

            formData.append('folderType', 'Post'); // Thêm folderType vào FormData
        
            if (data.imageUrl && data.imageUrl.length > 0) {
                Array.from(data.imageUrl).forEach((file) => {
                    formData.append('files', file); // 'files' là key server sẽ nhận
                });
            }

            // 4. Gửi request với FormData
            const response = await axios.post('http://localhost:3000/api/discussion', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Quan trọng để browser hiểu
                }
            });
            reset();

            if(response.status === 201) {
                alert('Bài đăng đã được tạo thành công!');
            }

            setRefreshTrigger(prev => prev + 1);
        } 
    catch (err) {
            console.error("Error creating post: " + err);
            alert('Server error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="discussion-page-container">
            <form className='register-discussion' onSubmit={handleSubmit(onSubmit)}>
                <label className='discussion-title'>Tiêu đề</label>
                <input className='discussion-input' type='text' {...register('title', {required: 'Tiêu đề là bắt buộc'})} placeholder='Nhập tiêu đề...'/>

                <br/>

                <label className='discussion-title' htmlFor="content">Nội dung</label>
                <textarea className='discussion-textarea' {...register('content', { required: 'Nội dung là bắt buộc' })} placeholder='Nhập nội dung...'/>
                {errors.content && <p style={{color: 'red'}}>{errors.content.message}</p>}

                <br/>

                <label htmlFor="imageUrl" className='discussion-title'>
                    Chọn ảnh
                </label>
                <input 
                    id="imageUrl" 
                    type='file' 
                    accept='image/*' 
                    multiple
                    {...register('imageUrl')} 
                />
                
                <br/>
                <button type="submit" className='discussion-submit'>Đăng bài</button>
            </form>
        </div>
    );
}

export default Discussion;