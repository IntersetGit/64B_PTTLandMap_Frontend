import { useDispatch, useSelector } from "react-redux";
import { delToken } from '../../redux/actions/userActions'
import { useRouter } from 'next/dist/client/router';
import { Tooltip } from 'antd';
import Link from 'next/link';

const Navbar = ({ isMap, setslideNav, slideNav }) => {
    const { user } = useSelector(({ user }) => user);
    const dispatch = useDispatch();
    const route = useRouter()

    const logout = () => {
        dispatch(delToken())
        route.push("/login")
    }

    return (

        <div className="header">

            <div className="header-left">
                <Link href={`/`} >
                    <a className="logo">
                        <img src="/assets/images/logo_PTT.png" width={100} />
                    </a>
                </Link>
            </div>

            {!isMap ? <a id="toggle_btn" href="javascript:void(0);">
                <span className="bar-icon">
                    <span />
                    <span />
                    <span />
                </span>
            </a> : null}


            <div className="page-title-box">
                <h3><b>PTT Land Map</b></h3>
            </div>

            {/* id="mobile_btn" */}
            <a className="mobile_btn" href="#sidebar" onClick={() => {
                setslideNav(slideNav ? "" : "slide-nav")
            }}><i className="fa fa-bars" /></a>

            <ul className="nav user-menu">

                <Tooltip placement="bottom" title={"แผนที่"}>
                    <li className="nav-item dropdown">
                        <Link href={`/`} >
                            <a className="dropdown-toggle nav-link" >
                                <i className="fa fa-map" />
                            </a>
                        </Link>
                    </li>
                </Tooltip>

                {/* ระบบหลังบ้าน */}
                {
                    (user && user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2") ?
                        <Tooltip placement="bottom" title={"ระบบหลังบ้าน"}>
                            <li className="nav-item dropdown">
                                <Link href={`/settings/dashboard/`} >
                                    <a className="dropdown-toggle nav-link" >
                                        <i className="fa fa-cog" />
                                    </a>
                                </Link>
                            </li>
                        </Tooltip>
                        : null
                }

                <li className="nav-item dropdown has-arrow main-drop">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown">
                        <span><i className="la la-user" /> {user ? `${user.user_name} (${user.roles_name}) ` : "-"}</span>
                    </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" onClick={logout}>ออกการระบบ</a>
                    </div>
                </li>


            </ul>

            <div className="dropdown mobile-user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
                <div className="dropdown-menu dropdown-menu-right">
                    {
                        (user && user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2") ? (
                            <>
                                <Link href={`/`} >
                                    <a className="dropdown-item">หน้าแรก</a>
                                </Link>
                                <Link href={`/settings/dashboard/`} >
                                    <a className="dropdown-item">ระบบหลังบ้าน</a>
                                </Link>
                            </>
                        ) : null
                    }
                    <a className="dropdown-item" onClick={logout}>ออกการระบบ</a>
                </div>
            </div>

        </div >
    )
}

export default Navbar
