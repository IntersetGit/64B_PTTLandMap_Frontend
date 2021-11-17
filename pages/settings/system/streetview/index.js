import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Head from "next/head";
import System from "../../../../components/_App/System";
import moment from "moment";
import { MoreOutlined } from "@ant-design/icons";
import {
    Col,
    Row,
    Form,
    Input,
    Radio,
    Button,
    DatePicker,
    Select,
    Upload,
    Table,
    Modal,
    Dropdown,
    Menu,
    Image,
} from "antd";
import Api from "../../../../util/Api";
import { UploadOutlined, RedoOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Search } = Input;
const index = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [dataEdit, setDataEdit] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isModalVisible, setIsModalVisible] = useState({
        create: false,
        edit: false,
    });
    const [menuItem, setMenuItem] = useState([]);
    const [formCreate] = Form.useForm();
    const [formEdit] = Form.useForm();
    const columns = [
        {
            key: "1",
            title: <b>ลำดับ</b>,
            dataIndex: "number",
            width: 200,
            sorter: (record1, record2) => {
                return record1.number > record2.number;
            },
        },

        {
            key: "2",
            title: <b>Latitude,Longitude</b>,
            dataIndex: "coordinate",
            width: 200,
            sorter: (record1, record2) => {
                return record1.layer_name > record2.layer_name;
            },
            render: (t) => { return (t.lat + "," + t.log) }
        },
        {
            key: "3",
            title: <b>ชื่อภาพถ่าย</b>,
            dataIndex: "name",
            sorter: (record1, record2) => {
                return record1.wms > record2.wms;
            },
        },
        {
            key: "4",
            title: <b>จัดการ</b>,
            dataIndex: "id",
            render: (id, row) => {
                return (
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item
                                    key="1"
                                    onClick={async () => {
                                        await handleCancel(),
                                            await handleEdit(row);
                                    }}
                                >
                                    แก้ไข
                                </Menu.Item>
                                <Menu.Item
                                    key="2"
                                    onClick={() => {
                                        deleteHandle(id);
                                    }}
                                >
                                    ลบ
                                </Menu.Item>
                            </Menu>
                        }
                        placement="bottomLeft"
                        trigger={["click"]}
                        arrow
                    >
                        <MoreOutlined />
                    </Dropdown>
                );
            },
        },
    ];
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };
    const showModal = (value) => {
        setIsModalVisible((data) => {
            return { ...data, [value]: true };
        });
    };
    const handleOk = (form) => {
        if (form === "formCreate") {
            formCreate.submit();
        }
        if (form === "formEdit") {
            formEdit.submit();
        }
    };
    const handleCancel = () => {
        setIsModalVisible({ create: false, edit: false });
        formCreate.resetFields();
        formEdit.resetFields();
    };
    const onValuechangeAdd = (e) => {
        let key = Object.keys(e);
        if (key[0] == "url") {
            let latlng = filterlatlng(e[key[0]]);
            if (latlng) {
                formCreate.setFieldsValue({ Lat: latlng.lat, Lng: latlng.lng })
            } else {
                formCreate.setFieldsValue({ Lat: "", Lng: "" })
            }
        }
    }
    const onValuechangeEdit = (e) => {
        let key = Object.keys(e);
        if (key[0] == "url") {
            let latlng = filterlatlng(e[key[0]]);
            if (latlng) {
                formEdit.setFieldsValue({ Lat: latlng.lat, Lng: latlng.lng })
            } else {
                formEdit.setFieldsValue({ Lat: "", Lng: "" })
            }
        }
    }

    function filterlatlng(url) {
        let result = url.split('/');
        let res = result.filter(i => i.startsWith("@")).toString();
        let cutstring = res.replace('@', '');
        let rescut = cutstring.split(',').slice(0, 2);
        if (rescut == "") {
            return false;
        } else {
            return {
                lat: rescut[0],
                lng: rescut[1]
            }
        }
    }
    const onFinishCreate = (value) => {
        console.log('latlng :>> ', filterlatlng(value.url));
        setLoading(true);
        let data = {
            coordinate: {
                lat: value.Lat, log: value.Lng
            },
            name: value.name,
            url: value.url
        }
        Api.post("/streetview/createAndEditDatStreetView", data)
            .then(async (data) => {
                setIsModalVisible({ create: false, edit: false });
                reload();
                setLoading(false);
                formCreate.resetFields();
                await Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
                // window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    };
    const onFinishEdit = async (value) => {
        try {

            Swal.fire({
                title: "กรุณายืนยันการแก้ไขข้อมูล",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#218838",
                cancelButtonColor: "#d33",
                confirmButtonText: "ยืนยัน",
                cancelButtonText: "ยกเลิก",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let data = {
                        id: value.id,
                        coordinate: {
                            lat: value.Lat, log: value.Lng
                        },
                        name: value.name,
                        url: value.url
                    }
                    Api.post("/streetview/createAndEditDatStreetView", data).then(async (data) => {
                        console.log('data :>> ', data);
                        setIsModalVisible({ create: false, edit: false });
                        setLoading(false);
                        await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
                        window.location.reload();
                        formEdit.resetFields();
                    }).catch((error) => {
                        console.log('error :>> ', error);
                    })

                }
            });
        } catch (error) {
            console.log(error);
            Swal.fire("", "มีบางอย่างผิดพลาด", "success");
        }
    };
    const deleteHandle = (id) => {
        try {
            Swal.fire({
                title: "กรุณายืนยันการลบข้อมูล?",
                text: "เมื่อยืนยันแล้วจะไม่สามารถเรียกคืนได้",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#218838",
                cancelButtonColor: "#d33",
                confirmButtonText: "ยืนยัน",
                cancelButtonText: "ยกเลิก",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoading(true);
                    const resp = await Api.delete("/streetview/deleteDatStreetView?id=" + id);
                    Swal.fire("", "ลบข้อมูลเรียบร้อยแล้ว", "success");
                    reload();
                }
            });
        } catch (error) {
            console.log(error);
            Swal.fire("", "มีบางอย่างผิดพลาด ไม่สามารถลบข้อมูลได้", "error");
            setLoading(false);
        }
    };
    const handleEdit = async (row) => {
        console.log('row :>> ', row);
        formEdit.setFieldsValue({ ...row, Lat: row.coordinate?.lat, Lng: row.coordinate?.log })
        showModal("edit");

    };

    const reload = async (search = "") => {
        try {
            const respData = await Api.get(`streetview/getAllDatStreetView?search=${search}`);
            let tempDataArray = [];
            respData.data.items.forEach((data, key) => {
                tempDataArray = [
                    ...tempDataArray,
                    {
                        number: key + 1,
                        ...data,
                    },
                ];
            });
            setData(tempDataArray);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };
    useEffect(() => {
        reload();
    }, loading);
    return (
        <System>
            <Head>
                <title>จัดการ ภาพถ่ายStreetView</title>
            </Head>
            <Row
                gutter={[10, 10]}
                style={{
                    background: "white",
                    padding: "16px",
                    boxShadow:
                        " rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                }}
            >
                <Col span={24}>
                    <h3 className="mb-4">จัดการ ภาพถ่ายStreetView</h3>
                </Col>
                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={5}>
                    <Search
                        placeholder="ค้นหาภาพถ่าย"
                        onSearch={(e) => {
                            reload(e);
                        }}
                    />
                </Col>
                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={11}>

                </Col>
                <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8} >
                    <Button
                        type="primary"
                        style={{ float: "right" }}
                        onClick={() => showModal("create")}
                    >
                        + เพิ่มภาพถ่าย
                    </Button>
                </Col>
                <Col span={24}>
                    <div>
                        <Table
                            scroll={{ x: true }}
                            loading={loading}
                            columns={columns}
                            dataSource={data}
                            pagination={{
                                current: page,
                                pageSize: pageSize,
                                onChange: (page, pageSize) => {
                                    setPage(page);
                                    setPageSize(pageSize);
                                },
                            }}
                        />
                    </div>
                </Col>
            </Row>

            <Modal
                title="เพิ่มภาพถ่าย StreetView"
                visible={isModalVisible.create}
                onOk={() => handleOk("formCreate")}
                onCancel={handleCancel}
                centered

            >
                <Form
                    form={formCreate}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    onFinish={onFinishCreate}
                    onValuesChange={onValuechangeAdd}

                >
                    <Form.Item
                        name="name"
                        label="ชื่อ"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="ชื่อ" />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="Url"
                        rules={[{ required: true, message: "กรุณากรอก url จาก GoogleMap" }]}
                    >
                        <Input placeholder="Url" />
                    </Form.Item>
                    <Form.Item label="Lat,Lng" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                        <Form.Item
                            name="Lat"
                            rules={[{ required: true, message: "กรุณาตรวจสอบ url " }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
                        >
                            <Input placeholder="Lat" disabled />
                        </Form.Item>
                        <span
                            style={{ display: 'inline-block', width: '24px', lineHeight: '32px', textAlign: 'center' }}
                        >
                            -
                        </span>
                        <Form.Item
                            name="Lng"
                            rules={[{ required: true, message: "กรุณาตรวจสอบ url " }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                            <Input placeholder="Lng" disabled />
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="แก้ไข ภาพถ่าย StreetView"
                visible={isModalVisible.edit}
                onOk={() => {
                    handleOk("formEdit");
                }}
                onCancel={handleCancel}
                centered
            >
                <Form
                    form={formEdit}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    onFinish={onFinishEdit}
                    onValuesChange={onValuechangeEdit}
                >
                    <Form.Item name="id" label="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="ชื่อ"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="ชื่อ" />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="Url"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Url" />
                    </Form.Item>
                    <Form.Item label="Lat,Lng" style={{ marginBottom: 0 }}>
                        <Form.Item
                            name="Lat"
                            rules={[{ required: true, message: "กรุณาตรวจสอบ url " }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
                        >
                            <Input placeholder="Lat" disabled />
                        </Form.Item>
                        <span
                            style={{ display: 'inline-block', width: '24px', lineHeight: '32px', textAlign: 'center' }}
                        >
                            -
                        </span>
                        <Form.Item
                            name="Lng"
                            rules={[{ required: true, message: "กรุณาตรวจสอบ url " }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
                            <Input placeholder="Lng" disabled />
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Modal>
        </System>
    );
};

export default index;
