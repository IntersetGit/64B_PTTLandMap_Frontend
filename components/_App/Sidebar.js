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
                            <span>ประกันออนไลน์</span>
                        </li>

                        <li className={activeHref(`/`)}>
                            <Link href={`/`} >
                                <a><i className="la la-dashboard" /> <span>Dashboard</span></a>
                            </Link>
                        </li>

                        <li className="submenu">
                            <a><i className="la la-cube" /> <span> ข้อมูลประกันภัย</span> <span className="menu-arrow" /></a>
                            <ul style={{ display: 'none' }}>
                                <li>
                                    <Link href={`/`} >
                                        <a className={""}>รายการประกันภัย</a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/`} >
                                        <a className={""}>คำสั่งซื้อ</a>
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className="menu-title">
                            <span>จัดการระบบหลังบ้าน</span>
                        </li>

                        <li className={activeHref(`/system/usersSystem/`)}>
                            <Link href={`/system/usersSystem/`} >
                                <a><i className="la la-user" /> <span>จัดการผู้ใช้ระบบ</span></a>
                            </Link>
                        </li>

                        <li>
                            <Link href={`/`} >
                                <a><i className="la la-cog" /> <span>จัดการประเภทประกันภัย</span></a>
                            </Link>
                        </li>

                        <li>
                            <Link href={`/`} >
                                <a><i className="la la-cog" /> <span>จัดการช่วงอายุประกันภัย</span></a>
                            </Link>
                        </li>


                        {/* <li className="submenu">
                            <a href="javascript:void(0);"><i className="la la-share-alt" /> <span>Multi Level</span> <span className="menu-arrow" /></a>
                            <ul style={{ display: 'none' }}>
                                <li className="submenu">
                                    <a href="javascript:void(0);"> <span>Level 1</span> <span className="menu-arrow" /></a>
                                    <ul style={{ display: 'none' }}>
                                        <li><a href="javascript:void(0);"><span>Level 2</span></a></li>
                                        <li className="submenu">
                                            <a href="javascript:void(0);"> <span> Level 2</span> <span className="menu-arrow" /></a>
                                            <ul style={{ display: 'none' }}>
                                                <li><a href="javascript:void(0);">Level 3</a></li>
                                                <li><a href="javascript:void(0);">Level 3</a></li>
                                            </ul>
                                        </li>
                                        <li><a href="javascript:void(0);"> <span>Level 2</span></a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="javascript:void(0);"> <span>Level 1</span></a>
                                </li>
                            </ul>
                        </li> */}

                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
