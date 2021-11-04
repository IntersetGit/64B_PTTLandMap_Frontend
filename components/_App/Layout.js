import { useEffect, useState } from 'react'
import Head from "next/head"
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { ConfigProvider } from 'antd';
import "moment/locale/th";
import locale from 'antd/lib/locale/th_TH';
import { useRouter } from 'next/dist/client/router';
import { Cookies } from 'react-cookie'
import Preloader from './Preloader'
import "moment/locale/th";
import { useDispatch } from 'react-redux';
import jwt_decode from "jwt-decode";
import RefreshToken from "../../util/RefreshToken";
import { delToken } from '../../redux/actions/userActions';

function Layout({ children, isMap = false, navbarHide }) {
    const route = useRouter()
    const dispatch = useDispatch();
    const [loader, setLoader] = useState(false);
    const [slideNav, setslideNav] = useState("") //slide-nav
    const [events, setEvents] = useState([
        "load",
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress"])

    useEffect(() => {
        const cookies = new Cookies();
        const token = cookies.get('token');
        if (token) {
            const token_decode = jwt_decode(token);
            if ((token_decode.exp * 1000) - (10 * 60 * 1000) <= new Date().getTime()) {
                console.log("หมดเวลาtoken");
                const refresh_token = cookies.get('refresh_token');
                RefreshToken(refresh_token);
            } else {
                let timeout;
                const setTime = () => {
                    timeout = setTimeout(() => {
                        console.log("logout");
                        logout()
                        clearTimeout(timeout);
                    }, 1800000); // 1800000 = 30 min
                }
                for (var i in events) {/*ตรวจจับทุกอีเวน์ในการเคลื่อนไหว*/
                    window.addEventListener(events[i], () => {
                        clearTimeout(timeout);
                        setTime()
                    });
                }
            }

        } else route.push("/login")
    })

    const logout = () => {
        dispatch(delToken())
        route.push("/login")
    }

    // useEffect(() => {
    //     setTimeout(() => setLoader(false), 500);
    // }, [])

    return (
        <ConfigProvider locale={locale}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            </Head>
            {!isMap ? (
                <div className={`main-wrapper ${slideNav}`}>
                    <Navbar slideNav={slideNav} setslideNav={setslideNav} />
                    <Sidebar />

                    <div className="page-wrapper">
                        <div className="content container-fluid">
                            {loader ? <Preloader /> : children}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="main-wrapper-map">
                    <Navbar isMap={isMap} navbarHide={navbarHide} />
                    <div className="page-wrapper-map">
                        <div className="content container-fluid-map">
                            {children}
                        </div>
                    </div>

                </div>
            )}

        </ConfigProvider>
    )
}

export default Layout
