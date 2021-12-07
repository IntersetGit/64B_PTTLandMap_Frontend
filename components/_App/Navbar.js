import { useDispatch, useSelector } from "react-redux";
import { delToken } from '../../redux/actions/userActions'
import { useRouter } from 'next/dist/client/router';
import { Tooltip } from 'antd';
import Link from 'next/link';
import Api from "../../util/Api";
import { Modal, Button, Input, Form } from 'antd';
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

const Navbar = ({ isMap, setslideNav, slideNav, navbarHide }) => {
    const { user } = useSelector(({ user }) => user);
    const dispatch = useDispatch();
    const route = useRouter()
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formChangePassword] = Form.useForm();

    const logout = () => {
        dispatch(delToken())
        route.push("/login")
    }
    /**
     * 
     * @param {*} sumbit 
     */
    const changePassword = async (sumbit) => {
        try {
            console.log("sumbit: >>>>>>> ", sumbit);
            const data = { ...sumbit }

            await Api.post('provider/editpassword', data);
            await Swal.fire({
                icon: 'success',
                text: "เปลี่ยนรหัสผ่านสำเร็จ!!"
            });
            formChangePassword.resetFields();
            setIsModalVisible(false);

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: error,
            });
        }
    }
    /**
     * ฟังก์ปุ่มตกลง popup
     */
    const handleOk = () => {
        formChangePassword.submit();
    };
    /**
     * ฟังกปุ่มยกเลิก popup
     */
    const handleCancel = () => {
        formChangePassword.resetFields();
        setIsModalVisible(false);
    };
    /**
     * ฟังก์กดโชว์ popup
     */
    const showModal = () => {
        setIsModalVisible(true);
    };

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
            }}>
                {!isMap ? <i className="fa fa-bars" /> : null}
            </a>

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

                        <a className="dropdown-toggle nav-link" href={`/Manual/คู่มือการใช้งานระบบ_PTT_Land_Map_Application.pdf`} target="_blank">
                            <i className="fa fa-book" style={!isMap ? { background: "linear-gradient(141deg, #0fb8ad 0%, #1fc8db 51%, #2cb5e8 75%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : null} />
                        </a>

                    </li>
                </Tooltip>

                {/* ระบบหลังบ้าน */}
                {
                    (user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ?
                        <Tooltip placement="bottom" title={"Back Office"}>
                            <li className="nav-item dropdown">
                                <Link href={`/settings/dashboard/report-summary/`} >
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
                        {(user && user.is_ad ? null :
                            <a className="dropdown-item" onClick={showModal}>
                                เปลี่ยนรหัสผ่าน
                            </a>)}
                        <a className="dropdown-item" onClick={logout}>ออกจากระบบ</a>
                    </div>
                </li>
            </ul>

            <div className="dropdown mobile-user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v" /></a>
                <div className="dropdown-menu dropdown-menu-right">
                    {
                        (user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? (
                            <>
                                <Link href={`/`} >
                                    <a className="dropdown-item">แผนที่</a>
                                </Link>

                                <a className="dropdown-item" href={`/Manual/คู่มือการใช้งานระบบ_PTT_Land_Map_Application.pdf`} target="_blank">คู่มือการใช้งาน</a>

                                <Link href={`/settings/dashboard/report-summary/`} >
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
            {/* โมเดล เปลี่ยนรหัสผ่าน */}
            <div>
                <Modal
                    title="เปลี่ยนรหัสผ่าน"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <Form
                        form={formChangePassword}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 10 }}
                        onFinish={changePassword}
                    >
                        <Form.Item
                            name="currentPassword"
                            label="รหัสผ่านปัจจุบัน"
                            rules={[
                                { required: true, message: "กรุณารหัสผ่านปัจจุบัน" },
                                { min: 8, message: 'รหัสผ่านมีความยาวอย่างน้อย 8 ตัวอักษร' },
                            ]}
                        >
                            <Input.Password type="password" />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label="รหัสผ่านใหม่"
                            rules={[
                                { required: true, message: "กรุณารหัสผ่านใหม่" },
                                { min: 8, message: 'รหัสผ่านมีความยาวอย่างน้อย 8 ตัวอักษร' },
                            ]}
                            hasFeedback
                        >
                            <Input.Password type="password" />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="ยืนยันรหัสผ่าน"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: "กรุณายืนยันรหัสผ่าน" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('ยืนยันรหัสผ่านไม่ตรงกัน!!'))
                                    }
                                })
                            ]}
                            hasFeedback
                        >
                            <Input.Password type="password" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div >
    )
}

export default Navbar
