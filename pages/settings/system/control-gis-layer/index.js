import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Api from "../../../../util/Api";
import moment from "moment";
import Swal from "sweetalert2";
import { MoreOutlined, RedoOutlined } from "@ant-design/icons";
import {
  Table,
  Input,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Select,
  Menu,
  Dropdown,
  // Upload,
  Radio,
  DatePicker
} from "antd";
const { Search } = Input;
const { Option } = Select;
const usersSystemPage = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [statusValidation, setStatusValidation] = useState([]);
  const [menuItem, setMenuItem] = useState([]);
  const [listGroup, setListGroup] = useState([]);
  const [dataEdit, setDataEdit] = useState([]);
  // const [buttonCreate, setButtonCreate] = useState(true); //สถานะเปิดปิดsubmit ตอนmodal create
  const [form] = Form.useForm();
  const [formCreate] = Form.useForm();
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      // dataIndex: "number",
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
      render: (a, b, i) => i + 1
    },
    {
      key: "2",
      title: "ชื่อ",
      dataIndex: "name_layer",
      sorter: (record1, record2) => {
        return record1.name_layer > record2.name_layer;
      },
    },
    {
      key: "3",
      title: "Group Layer",
      dataIndex: "group_name",
      sorter: (record1, record2) => {
        return record1.group_name > record2.group_name;
      },
    },
    {
      key: "5",
      title: "จัดการ",
      // width: 200,
      dataIndex: "id",
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
      // responsive: ["md"],
    },
  ];

  const [select, setSelect] = useState()

  const getgroup = () => {
    Api.post("masterdata/getMasLayers", { group_name: "" })
      .then(async (data) => {
        setSelect(data.data.items)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const onSearch = async (value) => {
    Api.get(`masterdata/masLayersShape?search=${value}`).then((data) => {
      setData(data.data.items);
    })
      .catch((error) => {
        console.log(error);
      });
  };

  const reload = (search = null) => {
    setLoading(true);
    Api.get("masterdata/masLayersShape", search != null ? { search: search } : {})
      .then(({ data: { items } }) => {
        let tempDataArray = [];
        console.log(`data`, data)
        items.forEach((data) => {
          tempDataArray = [
            ...tempDataArray,
            {
              ...data,
            },
          ];
        });
        console.log(`tempDataArray`, tempDataArray)
        setData(tempDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const changeTypeServer = (e) => {
    const type = e.target.value;
    setMenuItem([]);
    if (type !== "arcgisserver") {
      setMenuItem(
        <>
          <Form.Item
            name="layerName"
            label="Layer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Layer Name" />
          </Form.Item>
        </>
      );
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  useEffect(() => {
    reload();
    getgroup();
  }, []);

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
          const resp = await Api.delete(`masterdata/masLayersShape?id=` + id);
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

  const handleEdit = async (show) => {
    setIsModalVisible(true)
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
          let resp = await Api.post("masterdata/masLayersShape", {
            ...data,
            id: form.getFieldValue().id,
          });
          await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
          reload();
          handleCancel();
        }
        console.log("sdasd", form.getFieldValue())
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showModal2 = () => {
    setIsModalVisible2(true);
  };
  const handleOk = () => {
    form.submit();
  };

  const handleOk2 = (form) => {
    form.submit();
  };
  const handleCancel2 = () => {
    setIsModalVisible2(false);
    form.resetFields();
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinishCreate = async (value) => {
    let filterRoles = await roles.find(
      (data) => data.roles_name === value.roles_id
    );
    setLoading(true);
    Api.post("/system/addUserAD", {
      username: value.username,
      roles_id: filterRoles.id,
    })
      .then((data) => {
        Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
        setStatusValidation([]);
        setIsModalVisible({ create: false, edit: false });
        setLoading(false);
        formCreate.resetFields();
        reload();
        setButtonCreate(true);
      })
      .catch((error) => {
        Swal.fire("", "มีบางอย่างผิดพลาด หรือมีผู้ใช้ในระบบแล้ว", "error");
        console.log(error);
        setStatusValidation([]);
        setIsModalVisible({ create: false, edit: false });
        setLoading(false);
        formCreate.resetFields();
        reload();
        setButtonCreate(true);
      });
  };


  // const onFinish = async (value) => {
  //   setLoading(true);
  //   Api.post("/system/addUserAD", {
  //     username: value.username,
  //     roles_id: value.roles_id,
  //   })
  //     .then((data) => {
  //       setIsModalVisible(false);
  //       setLoading(false);
  //       reload();
  //       form.resetFields();
  //     })
  //     .catch((error) => {
  //       alert("มีบางอย่างผิดพลาด หรือมีผู้ใช้ในระบบแล้ว");
  //       setIsModalVisible(false);
  //       setLoading(false);
  //     });
  //   form.resetFields();
  // };

  return (
    <>
      <Head>
        <title>จัดการผู้ใช้ระบบ</title>
      </Head>
      <System>
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
            <h3 className="mb-4">จัดการข้อมูล GIS Layer</h3>
          </Col>
          <Col xs={10} sm={8} md={8} lg={8} xl={5} xxl={5}>
            <Search placeholder="input search text"
              onSearch={onSearch}
            />
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
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
            <Button
              type="primary"
              onClick={showModal2}
              style={{ float: "right" }}
            >
              + เพิ่ม WMS ของ GIS Layer
            </Button>
          </Col>
          <Col span={24}>
            <div >
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
      </System>
      <Modal
        title="เพิ่ม WMS ของ GIS Layer"
        visible={isModalVisible2}
        onOk={() => handleOk2}
        onCancel={handleCancel2}
      // okButtonProps={{ disabled: buttonCreate }}
      >
        <Form
          form={formCreate}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishCreate}
        >
          <Form.Item
            name="typename"
            label="ประเภทของภาพ"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="typename"
            label="ประเภทของภาพ"
            rules={[{ required: true }]}
          >
            <Select placeholder="ประเภทของภาพ">
              <Option value="ภาพถ่ายจากดาวเทียม">ภาพถ่ายจากดาวเทียม</Option>
              <Option value="ภาพถ่ายทางอากาศจากโดรน">
                ภาพถ่ายทางอากาศจากโดรน
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="wms"
            label="ชื่อข้อมูล (WMS)"
            rules={[{ required: true }]}
          >
            <Input placeholder="wms_url" />
          </Form.Item>
          <Form.Item name="url" label="url" rules={[{ required: true }, { type: "url" }]}>
            <Input placeholder="url" />
          </Form.Item>
          {menuItem}
          <Form.Item
            name="typeserver"
            label=" "
            wrapperCol={{ span: 12 }}
            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => {
                changeTypeServer(e);
              }}
            >
              <Radio value="arcgisserver">ArcGIS Server</Radio>
              <Radio value="imageserver">Image Server</Radio>
              <Radio value="geoserver">Geoserver</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="แก้ไขข้อมูล GIS"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
        >
          <Form.Item
            name="name_layer"
            label="ชื่อ"
            rules={[{ required: true }]}
            {...statusValidation}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="group_layer_id"
            label="Group Layer"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล กลุ่มผู้ใช้งาน" },
            ]}
          ><Select
            placeholder="กลุ่มผู้ใช้งาน"
          // defaultValue=""
          >
              {select && select.map((data, index) => (
                <Option key={index} value={data.id}>
                  {data.group_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="สี GIS Layer"
            rules={[{ required: true }]}
          >
            <Input type="color" style={{ width: '15%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default usersSystemPage;
