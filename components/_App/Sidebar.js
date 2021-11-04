import React from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux';

function Sidebar() {
    // 8a97ac7b-01dc-4e06-81c2-8422dffa0ca2 = user: Administrator
    // cec6617f-b593-4ebc-9604-3059dfee0ac4 = user: Editor
    // 0678bba5-a371-417f-9734-aec46b9579ad= user: Viewer

    const { asPath } = useRouter()
    const activeHref = (path) => asPath.toUpperCase() === path.toUpperCase() ? "active" : "";
    const { user } = useSelector(({ user }) => user);

    return (
        <div className="sidebar" id="sidebar" style={{ zIndex: "2" }}>
            <div className="sidebar-inner slimscroll">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        <li className="menu-title">
                            <span>Report/Dashboard</span>
                        </li>

                        {/* Administrator And Editor */}
                        {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <li className={activeHref(`/settings/dashboard/report-summary/`)}>
                                <Link href={`/settings/dashboard/report-summary/`} >
                                    <a><img src="/assets/images/icon/8.png" className=" pb-2" alt="" width={23} /> <span >รายงานการสรุปผล <br /><h5 className="pt-2">การดำเนินงาน</h5></span></a>
                                </Link>
                            </li>
                        ) : null}


                        <li className="menu-title">
                            <span>จัดการข้อมูล</span>
                        </li>

                        {/* Administrator */}
                        {(user && user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2") ? (
                            <li className={activeHref(`/settings/system/users/`)}>
                                <Link href={`/settings/system/users/`} >
                                    <a><img src="/assets/images/icon/11.png" className=" pb-2" alt="" width={25} /><span>จัดการ ผู้ใช้ระบบ</span></a>
                                </Link>
                            </li>
                        ) : null}

                        {/* Administrator And Editor */}
                        {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <li className={activeHref(`/settings/system/group-layer/`)}>
                                <Link href={`/settings/system/group-layer/`} >
                                    <a><img src="/assets/images/icon/5.png" className=" pb-2" alt="" width={25} /><span>จัดการ Group Layer</span></a>
                                </Link>
                            </li>
                        ) : null}


                        {/* Administrator And Editor */}
                        {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <li className={activeHref(`/settings/system/control-gis-layer/`)}>
                                <Link href={`/settings/system/control-gis-layer/`} >
                                    <a><img src="/assets/images/icon/4.png" className=" pb-2" alt="" width={23} /> <span >จัดการ ข้อมูล GIS Layer</span></a>
                                </Link>
                            </li>
                        ) : null}

                        {/* Administrator And Editor */}
                        {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <li className={activeHref(`/settings/system/satellite-aerial-photographs/`)}>
                                <Link href={`/settings/system/satellite-aerial-photographs/`} >
                                    <a><img src="/assets/images/icon/7.png" className=" pb-2" alt="" width={25} /> <span >จัดการ ภาพถ่ายดาวเทียม<h5 className="pt-2">และภาพถ่ายทางอากาศ</h5></span></a>
                                </Link>
                            </li>
                        ) : null}
                        {/* Administrator And Editor */}
                        {/* {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <li className={activeHref(`/settings/system/streetview/`)}>
                                <Link href={`/settings/system/streetview/`} >
                                    <a><img src="/assets/images/icon/9.png" className=" pb-2" alt="" width={25} /> <span >จัดการ ภาพถ่ายStreetView</span></a>
                                </Link>
                            </li>
                        ) : null} */}

                        {/* Administrator */}
                        {(user && user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2") ? (
                            <li className={activeHref(`/settings/system/control-status-project/`)}>
                                <Link href={`/settings/system/control-status-project/`} >
                                    <a><img src="/assets/images/icon/6.png" className=" pb-2" alt="" width={24} /><span > จัดการ Status โครงการ</span></a>
                                </Link>
                            </li>
                        ) : null}

                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
