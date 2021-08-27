import { useDispatch, useSelector } from "react-redux";
import { delToken } from '../../redux/actions/userActions'
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';

const Navbar = ({ isMap }) => {
    const { user } = useSelector(({ user }) => user);
    const dispatch = useDispatch();
    const route = useRouter()

    const logout = () => {
        dispatch(delToken())
        route.push("/signin")
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

            <a id="mobile_btn" className="mobile_btn" href="#sidebar"><i className="fa fa-bars" /></a>

            <ul className="nav user-menu">
                <li className="nav-item dropdown has-arrow main-drop">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown">
                        <span><i className="la la-user" /> {user ? `${user.username}` : "-"}</span>
                    </a>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" onClick={logout}>ออกการระบบ</a>
                    </div>
                </li>
            </ul>

            <div className="dropdown mobile-user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
                <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" onClick={logout}>ออกการระบบ</a>
                </div>
            </div>

        </div>
    )
}

export default Navbar
