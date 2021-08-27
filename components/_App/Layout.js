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

function Layout({ children, isMap = false }) {
    const route = useRouter()
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        const cookies = new Cookies();
        const token = cookies.get('token');
        // if (!token) route.push("/login")
    })

    useEffect(() => {
        setTimeout(() => setLoader(false), 500);
    }, [])

    return (
        <ConfigProvider locale={locale}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            </Head>
            {!isMap ? (
                <div className="main-wrapper">
                    <Navbar />
                    <Sidebar />

                    <div className="page-wrapper">
                        <div className="content container-fluid">
                            {loader ? <Preloader /> : children}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="main-wrapper-map">
                    <Navbar isMap={isMap} />
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
