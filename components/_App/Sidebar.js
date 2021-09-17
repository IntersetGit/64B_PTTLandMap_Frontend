import React from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'

function Sidebar() {
    const { asPath } = useRouter()
    const activeHref = (path) => asPath.toUpperCase() === path.toUpperCase() ? "active" : "";

    return (
        <div className="sidebar" id="sidebar" style={{zIndex:"2"}}>
            <div className="sidebar-inner slimscroll">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        <li className="menu-title">
                            <span>Report/Dashboard</span>
                        </li>
                        <li className={activeHref(`/settings/dashboard/report-summary/`)}>
                            <Link href={`/settings/dashboard/report-summary/`} >
                                <a><img src="/assets/images/icon/8.png" className=" pb-2" alt=""  width={23}/> <span >รายงานการสรุปผล <br /><h5 className="pt-2">การดำเนินงาน</h5></span></a>
                            </Link>
                        </li>
                        {/* <li className={activeHref(`/settings/dashboard/`)}>
                            <Link href={`/settings/dashboard/`} >
                                <a><i className="la la-pie-chart pb-2" /> <span >กราฟแสดง การส่งมอบ <br /><h5 className="pt-2">พื้นที่โครงการ</h5></span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/dashboard/progress/`)}>
                            <Link href={`/settings/dashboard/progress/`} >
                                <a><i className="la la-area-chart pb-2" /> <span >Progress การส่งมอบ<h5 className="pt-2">พื้นที่โครงการ</h5></span></a>
                            </Link>
                        </li> */}

                        <li className="menu-title">
                            <span>จัดการข้อมูล</span>
                        </li>

                        <li className={activeHref(`/settings/system/users/`)}>
                            <Link href={`/settings/system/users/`} >
                                <a><img src="/assets/images/icon/11.png" className=" pb-2" alt=""  width={25}/><span>จัดการผู้ใช้ระบบ</span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/system/group-layer/`)}>
                            <Link href={`/settings/system/group-layer/`} >
                                <a><img src="/assets/images/icon/5.png" className=" pb-2" alt=""  width={25}/><span>จัดการ Group Layer</span></a>
                            </Link>
                        </li>

                        <li className={activeHref(`/settings/system/control-gis-layer/`)}>
                            <Link href={`/settings/system/control-gis-layer/`} >
                                <a><img src="/assets/images/icon/4.png" className=" pb-2" alt=""  width={23}/> <span >จัดการ ข้อมูล GIS Layer</span></a>
                            </Link>
                        </li>
                        <li className={activeHref(`/settings/system/satellite-aerial-photographs/`)}>
                            <Link href={`/settings/system/satellite-aerial-photographs/`} >
                                <a><img src="/assets/images/icon/7.png" className=" pb-2" alt="" width={25}  /> <span >จัดการ ภาพถ่ายดาวเทียม<h5 className="pt-2">และภาพถ่ายทางอากาศ</h5></span></a>
                            </Link>
                        </li>
                        <li className={activeHref(`/settings/system/control-status-project/`)}>
                            <Link href={`/settings/system/control-status-project/`} >
                                <a><img src="/assets/images/icon/6.png" className=" pb-2" alt=""  width={24}/><span > จัดการ Status โครงการ</span></a>
                            </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
