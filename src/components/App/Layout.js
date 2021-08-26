import { useEffect, useState } from 'react'

import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { ConfigProvider } from 'antd';
import "moment/locale/th";
import locale from 'antd/lib/locale/th_TH';

import { Cookies } from 'react-cookie'
import Preloader from './Preloader'
import "moment/locale/th";

function Layout({ children }) {
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        const cookies = new Cookies();
        // const token = cookies.get('token');
        // if (!token) route.push("/signin")
    })

    useEffect(() => {
        setTimeout(() => setLoader(false), 500);
    }, [])

    return (
        <ConfigProvider locale={locale}>
            <div className="main-wrapper">
                <Navbar />
                <Sidebar />

                <div className="page-wrapper">
                    <div className="content container-fluid">
                        {loader ? <Preloader /> : children}
                    </div>
                </div>

            </div>
        </ConfigProvider>
    )
}

export default Layout
