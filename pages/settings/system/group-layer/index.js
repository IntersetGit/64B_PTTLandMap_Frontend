import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Swal from "sweetalert2";
import { useSelector } from 'react-redux'
import {
  MoreOutlined,
  RedoOutlined,
  UploadOutlined,
  DeleteOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import {
  Table,
  Modal,
  Input,
  Row,
  Col,
  Button,
  Form,
  Upload,
  message,
  Dropdown,
  Select,
  Menu,
  Space,
  Tooltip,
} from "antd";
import Api from "../../../../util/Api";
import axios from "axios";
const { Search } = Input;

const { Option } = Select;

const GroupLayerSystemPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [loding, setLoding] = useState(false)
  const [form] = Form.useForm();
  const user = useSelector(({ user }) => user.user);
  console.log(`user`, user)

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleOk2 = () => {
    form.submit();
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    form.resetFields();
  };

  const onFinish = async (value) => {
    console.log(value);
    let fd = new FormData();
    //console.log(value.Symbol[0].originFileObj)
    fd.append("file0", value.Symbol[0].originFileObj);
    Api.post("/masterdata/masLayers", { group_name: value.group_name })
      .then(async (data) => {
        reload();
        const upload = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=symbol_group&Length=1&Name=${data.data.items.id}&SetType=jpg`,
          fd
        );
        setIsModalVisible(!isModalVisible);
        Swal.fire("", "บันทึกเรียบร้อย", "success")

      })
      .catch((error) => {
        console.log(error);
      });
    form.resetFields();
  };
  const reload = () => {
    setLoding(true)
    Api.post("/masterdata/getmasLayers")
      .then(({ data: { items } }) => {
        setLoding(false)
        let tempDataArray = [];
        console.log(`data`, data)
        items.forEach((data, key) => {
          tempDataArray = [
            ...tempDataArray,
            {
              number: key + 1,
              ...data,
            },
          ];
        });
        console.log(`tempDataArray`, tempDataArray)
        setData(tempDataArray);
        setLoading(false);
      })
      .catch((error) => {
        setLoding(false)
        console.log(error);
      });
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  // const menu = (
  //   <Menu>
  //     <Menu.Item onClick={handleMenuClick1} key="1" icon={<DeleteOutlined />}>
  //       ลบ
  //     </Menu.Item>
  //     <Menu.Item onClick={handleMenuClick2} key="2" icon={<ScissorOutlined />}>
  //       แก้ไข
  //     </Menu.Item>
  //   </Menu>
  // );


  // function handleMenuClick1(e) {
  //   message.warning("เมนู ลบ.");
  //   console.log("click", e);
  // }
  // function handleMenuClick2(e) {
  //   message.info("เมนู แก้ไข.");
  //   console.log("click", e);
  // }

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "number",
      width: 100,
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
    },
    {
      title: "symbol",
      dataIndex: "symbol",
      render: (id) => {
        // return <MoreOutlined />
        return (
          <img
            width={16}
            height={16}
            src={id}
          />
        );
      },
    },
    {
      title: "ชื่อ group",
      dataIndex: "group_name",
      sorter: (record1, record2) => {
        return record1.group_name > record2.group_name;
      },
    },
    {
      title: "จัดการ",
      dataIndex: "id",
      width: 150,
      align: "center",
      render: (id, show) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => handleEdit(show)}
                >
                  แก้ไข
                </Menu.Item>
                <Menu.Item key="2" onClick={() => handleDelete(id)}>
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
      responsive: ["md"],
    },
  ];

  const handleEdit = async (show) => {
    setIsModalVisible2(true)
    console.log(`show`, show)
    form.setFieldsValue(show);
  }

  const onFinishEdit = async (data) => {
    console.log(`data`, data)
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

          setIsModalVisible2(!isModalVisible2);
          Swal.fire("", "บันทึกเรียบร้อย", "success")
          let resp = await Api.put("masterdata/masLayers", {
            ...data,
            id: form.getFieldValue().id,
            order_by: "7",
            isuse: 1,
            roles_id: user.roles_id,
            user_id: user.sysm_id,
          });
          let fd = new FormData();
          //console.log(value.Symbol[0].originFileObj)
          fd.append("file0", data.Symbol[0].originFileObj);
          const upload = await axios.post(
            `                            }}/upload?Path=symbol_group&Length=1&Name=${form.getFieldValue().id}&SetType=jpg`,
            fd
          );
          await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
          reload();
          handleCancel2();
        }
        console.log("sdasd", form.getFieldValue())
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };


  const handleDelete = async (id) => {
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
          const resp = await Api.delete(`masterdata/masLayers?id=` + id);
          console.log(resp);
          reload();
          Swal.fire("", "ลบข้อมูลเรียบร้อยแล้ว", "success");
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "error");
    }
  };

  const search = (value) => {
    Api.post("/masterdata/getmasLayers", { search: value }).then((data) => {
      setData(data.data.items);
    });
  };
  useEffect(() => {
    reload();
  }, []);

  return (
    <>
      <Head>
        <title>จัดการ Group Layer</title>
      </Head>
      <System>
        <Row
          gutter={[10, 10]}
          style={{
            background: "white",
            padding: "16px",
            boxShadow:
              " rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}>
          <Col span={24}>
            <h3>จัดการ Group Layer</h3>
          </Col>

          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={5}>
            <Search placeholder="input search text" onSearch={search} />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={11}>
            <Button
              onClick={() => {
                reload();
              }}
            >
              <RedoOutlined />
            </Button>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8} >
            <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ display: "block", float: "right" }}>
              + เพิ่ม group
            </Button>
          </Col>

          <Col span={24}>
            <Table
              loading={loding}
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
          </Col>
        </Row>
      </System>

      <Modal
        title="เพิ่ม Group Layer"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}


      >
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          colon={false}
          form={form}
          // labelCol={{ span: 7 }}
          // wrapperCol={{ span: 14 }}
          onFinish={onFinish}

        >
          <Form.Item
            name="group_name"
            label="Group Layer Name"
            rules={[
              { required: true, message: "Please input your grouplayer!" },
            ]}

          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Symbol"
            label="Symbol"
            valuePropName="fileList"
            rules={[{ required: true }]}
            getValueFromEvent={normFile}
            extra="ขนาดรูปภาพไม่เกิน 50*50 pixcel"
          >
            {/* <ImgCrop rotate> */}
            <Upload name="logo" action="/upload.do" listType="picture">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {/* </ImgCrop> */}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="แก้ไข Group Layer"
        visible={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}


      >
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          colon={false}
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}

        >
          <Form.Item
            name="group_name"
            label="Group Layer Name"
            rules={[
              { required: true, message: "Please input your grouplayer!" },
            ]}

          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Symbol"
            label="Symbol"
            valuePropName="fileList"
            rules={[{ required: true }]}
            getValueFromEvent={normFile}
            extra="ขนาดรูปภาพไม่เกิน 50*50 pixcel"
          >
            {/* <ImgCrop rotate> */}
            <Upload name="logo" action="/upload.do" listType="picture">
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {/* </ImgCrop> */}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupLayerSystemPage;
