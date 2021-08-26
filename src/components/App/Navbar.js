import React from 'react'

const Navbar = () => {



    return (

        <div className="header">

            <div className="header-left">
                <a className="logo">
                    <img src="/assets/img/logo-main.png" width={70} />
                </a>
            </div>

            <a id="toggle_btn" href="javascript:void(0);">
                <span className="bar-icon">
                    <span />
                    <span />
                    <span />
                </span>
            </a>

            <div className="page-title-box">
                <h3>ระบบหลังบ้าน บริษัท เดอะ เบสท์ บัดดี้ 19 จำกัด</h3>
            </div>

            <a id="mobile_btn" className="mobile_btn" href="#sidebar"><i className="fa fa-bars" /></a>

            <ul className="nav user-menu">
                <li className="nav-item dropdown has-arrow main-drop">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown">
                        <span><i className="la la-user" />Admin</span>
                    </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" >ออกการระบบ</a>
                    </div>
                </li>
            </ul>

            <div className="dropdown mobile-user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
                <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" >ออกการระบบ</a>
                </div>
            </div>

        </div>
    )
}

export default Navbar
