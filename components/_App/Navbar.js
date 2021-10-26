import { useDispatch, useSelector } from "react-redux";
import { delToken } from '../../redux/actions/userActions'
import { useRouter } from 'next/dist/client/router';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from "react";

const Navbar = ({ isMap, setslideNav, slideNav, navbarHide }) => {
    const { user } = useSelector(({ user }) => user);
    const dispatch = useDispatch();
    const route = useRouter()

    const logout = () => {
        dispatch(delToken())
        route.push("/login")
    }

    return (

        <div className="header" hidden={navbarHide}>

            <div className="header-left">
                <Link href={`/`} >
                    <a className="logo">
                        {!isMap ? <img src="/assets/images/logo_PTT.png" width={100} /> : <img src="/assets/images/logo_map_PTT.png" width={100} />}
                    </a>
                </Link>
            </div>

            {!isMap ? <a id="toggle_btn" href="javascript:void(0);">
                <span className="bar-icon ml-3">
                    <span />
                    <span />
                    <span />
                </span>
            </a> : null}

            {!isMap ? <a id="toggle_btn" href="javascript:void(0);">
                <div className="page-title-box">
                    <Link href={`/`} >
                        <a><h3><b>PTT Land Map</b></h3></a>
                    </Link>
                </div>
            </a> : null}

            {/* id="mobile_btn" */}
            <a className="mobile_btn" href="#sidebar" onClick={() => {
                setslideNav(slideNav ? "" : "slide-nav")
            }}><i className="fa fa-bars" /></a>

            <ul className="nav user-menu">

                <Tooltip placement="bottom" title={"Land Map"}>
                    <li className="nav-item dropdown">
                        <Link href={`/`} >
                            <a className="dropdown-toggle nav-link" >
                                <i className="fa fa-map" style={!isMap ? { background: "linear-gradient(141deg, #0fb8ad 0%, #1fc8db 51%, #2cb5e8 75%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : null} />
                            </a>
                        </Link>
                    </li>
                </Tooltip>

                <Tooltip placement="bottom" title={"Manual"}>
                    <li className="nav-item dropdown">

                        <a className="dropdown-toggle nav-link">
                            <i className="fa fa-book" style={!isMap ? { background: "linear-gradient(141deg, #0fb8ad 0%, #1fc8db 51%, #2cb5e8 75%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : null} />
                        </a>

                    </li>
                </Tooltip>

                {/* ระบบหลังบ้าน */}
                {
                    (user && user.roles_id !== "0678bba5-a371-417f-9734-aec46b9579ad") ?
                        <Tooltip placement="bottom" title={"Back Office"}>
                            <li className="nav-item dropdown">
                                <Link href={`/settings/dashboard/`} >
                                    <a className="dropdown-toggle nav-link" >
                                        <i className="fa fa-cog" style={!isMap ? { background: "linear-gradient(141deg, #0fb8ad 0%, #1fc8db 51%, #2cb5e8 75%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : null} />
                                    </a>
                                </Link>
                            </li>
                        </Tooltip>
                        : null
                }

                <li className="nav-item dropdown has-arrow main-drop">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown">
                        <span><i className="la la-user" /> {user ? `${user.first_name} (${user.roles_name}) ` : "-"}</span>
                    </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" onClick={logout}>ออกจากระบบ</a>
                    </div>
                </li>


            </ul>

            <div className="dropdown mobile-user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
                <div className="dropdown-menu dropdown-menu-right">
                    {
                        (user && user.roles_id !== "0678bba5-a371-417f-9734-aec46b9579ad") ? (
                            <>
                                <Link href={`/`} >
                                    <a className="dropdown-item">แผนที่</a>
                                </Link>

                                <a className="dropdown-item">คู่มือการใช้งาน</a>

                                <Link href={`/settings/dashboard/`} >
                                    <a className="dropdown-item">ระบบหลังบ้าน</a>
                                </Link>
                            </>
                        ) : null
                    }
                    <a className="dropdown-item" onClick={logout}>ออกจากระบบ</a>
                </div>
            </div>

            <style global jsx>
                {`
                    .header {
                        background: ${isMap ? '#5a7e8e' : '#fff'};
                    } 

                    .nav-item i {
                        color: ${isMap ? '#fff' : '#00aeef'};
                    }

                    .user-menu.nav > li > a {
                        color: ${isMap ? '#fff' : '#333'};
                    }
                        
                `


                }
            </style>
        </div >
    )
}

export default Navbar
