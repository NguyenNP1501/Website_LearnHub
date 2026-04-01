import { useEffect, useState } from "react";
import "./PracticeExam.scss";

function PracticeExam(){
    const [contest, setcontest] = useState([]);
    useEffect(()=>{
        fetch("https://dummyjson.com/products")
            .then(res => res.json())
            .then(data =>{
                console.log(data.products);
                setcontest(data.products);
            })
    }, []);
    return(
        <> 
            <div className="container">
            <div className="exambox">
                <h5>Quay lại</h5>
                {/* Quản lý đề */}
                <div className="exambox__managed row">
                    <div className="exambox__managed--exported col-xl-4">
                        <p>Đã xuất bản: 100</p>
                    </div>
                    <div className="exambox__managed--saved col-xl-4">
                        <p>Chưa xuất bản: 100</p>
                    </div>
                    <div className="exambox__managed--deleted col-xl-4">
                        <p>Đã xoá: 10</p>
                    </div>
                </div>
                {/* Tìm kiếm và tạo đề mới */}
                <h5>Tạo đề mới</h5>
                <div className="exambox__maked row">
                    <div className="exambox__maked--search col-xl-6">
                        <input type="text" placeholder="Nhập từ tên đê/khoá học/lớp ..."></input>
                        <button>Tìm kiếm</button>
                    </div>
                    <div className="exambox__maked--new col-xl-6">
                        <button>Tạo để thủ công</button>
                        <button>Tải file .csv</button>
                    </div>
                </div>
                {/* Các đề đã tạo*/}
                <h5>Các đề đã tạo</h5>
                <div className="exambox__created row">
                    {contest.map((item)=>(
                        <div className="exambox__created--item col-xl-2">
                            <img src={item.thumbnail} alt={item.title}></img>
                            <div className="descbox">
                                <p className="descbox__tile">{item.title}</p>
                                <div className="descbox__btn">
                                    <button>Xem</button>
                                    <button>Xoá</button>
                                    <button>Sửa</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </>
    )
}

export default PracticeExam;