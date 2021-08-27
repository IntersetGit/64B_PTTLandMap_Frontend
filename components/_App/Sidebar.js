import React from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'

function Sidebar() {
    const { asPath } = useRouter()
    const activeHref = (path) => asPath.toUpperCase() === path.toUpperCase() ? "active" : "";

    return (
        <div className="sidebar" id="sidebar">
            <div className="sidebar-inner slimscroll">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        <li className="menu-title">
                            <span>Dashboard</span>
                        </li>

                        <li className={activeHref(`/settings/dashboard/`)}>
                            <Link href={`/settings/dashboard/`} >
                                <a><i className="la la-pie-chart pb-2" /> <span >กราฟแสดง การส่งมอบ <br /><h5 className="pt-2">พื้นที่โครงการ</h5></span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/dashboard/progress/`)}>
                            <Link href={`/settings/dashboard/progress/`} >
                                <a><i className="la la-area-chart pb-2" /> <span >Progress การส่งมอบ<h5 className="pt-2">พื้นที่โครงการ</h5></span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/dashboard/export-excel/`)}>
                            <Link href={`/settings/dashboard/export-excel/`} >
                                <a><i className="la la-file-excel-o" /> <span >Export To Excel</span></a>
                            </Link>
                        </li>

                        <li className="menu-title">
                            <span>จัดการข้อมูล</span>
                        </li>

                        <li className={activeHref(`/settings/system/users/`)}>
                            <Link href={`/settings/system/users/`} >
                                <a><i className="la la-user" /> <span>จัดการผู้ใช้ระบบ</span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/system/group-layer/`)}>
                            <Link href={`/settings/system/group-layer/`} >
                                <a><i className="la la-object-group" /> <span>จัดการ Group Layer</span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/system/satellite-aerial-photographs/`)}>
                            <Link href={`/settings/system/satellite-aerial-photographs/`} >
                                <a><i className="la la-map-o pb-2" /> <span >จัดการ ภาพถ่ายดาวเทียม<h5 className="pt-2">และภาพถ่ายทางอากาศ</h5></span></a>
                            </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
