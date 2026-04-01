import logo from "../../assets/logo.png";
import "./Header.scss";

function Header(){
    return(
        <>
            <header className="header">
                <div>
                    <a href="#" target="_self" className="header__logo">
                        <img className="header__logo--image" src={logo} alt="Learn Hub"></img>
                        <p className="header__logo--name">Learn Hub</p>
                    </a>
                </div>
                <div className="header__tab">
                    <ul>
                        <li className="header__tab--item">
                            <a href="#" target="_self">
                                Trang chủ
                            </a>
                        </li>
                        <li className="header__tab--item">
                            <a href="#" target="_self">
                                Khoá học
                            </a>
                        </li>
                        <li className="header__tab--item">
                            <a href="#" target="_self">
                                Luyện đề
                            </a>
                        </li>
                        <li className="header__tab--item">
                            <a href="#" target="_self">
                                Thảo Luận
                            </a>
                        </li>
                        <li className="header__tab--item">
                            <a href="#" target="_self">
                                Trang cá nhân
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="logout__btn">
                    <button>Đăng xuất</button>
                </div>
            </header>
        </>
    )
}

export default Header;