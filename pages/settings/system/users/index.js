import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Api from "../../../../util/Api";
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
} from "antd";
const { Search } = Input;
const { Option } = Select;
const usersSystemPage = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState({
    create: false,
    edit: false,
  });
  const [buttonCreate, setButtonCreate] = useState(true); //สถานะเปิดปิดsubmit ตอนmodal create
  const [statusValidation, setStatusValidation] = useState([]);
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      dataIndex: "number",
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
    },
    {
      key: "2",
      title: "ชื่อเข้าใช้ระบบ",
      dataIndex: "user_name",
      sorter: (record1, record2) => {
        return record1.user_name > record2.user_name;
      },
    },
    {
      key: "3",
      title: "ชื่อ-นามสกุล",
      dataIndex: "firstlast",
      sorter: (record1, record2) => {
        return record1.firstlast > record2.firstlast;
      },
    },
    {
      key: "4",
      title: "อีเมล",
      dataIndex: "e_mail",
      sorter: (record1, record2) => {
        return record1.e_mail > record2.e_mail;
      },
    },
    {
      key: "5",
      title: "กลุ่มผู้ใช้งาน",
      dataIndex: "roles_name",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "6",
      title: "จัดการ",
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={async () => {
                    await handleEdit(id),
                      await handleCancel(),
                      await handleEdit(id);
                  }}
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
    },
  ];
  const reload = (search = null) => {
    Api.post(
      "/provider/getSearchUser",
      search != null ? { search: search } : {}
    )
      .then((data) => {
        let tempDataArray = [];
        data.data.forEach((data, key) => {
          tempDataArray = [
            ...tempDataArray,
            {
              number: key + 1,
              ...data,
            },
          ];
        });
        Api.get("/system/getUser").then((data) => {
          setRoles(data.data.items);
        });
        setData(tempDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    reload();
  }, []);

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
    setStatusValidation({
      validateStatus: "",
      help: "",
    });
    formCreate.resetFields();
    formEdit.resetFields();
    setButtonCreate(true);
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
        alert("บันทึกข้อมูลเรียบร้อย")
        setStatusValidation([]);
        setIsModalVisible({ create: false, edit: false });
        setLoading(false);
        formCreate.resetFields();
        reload();
        setButtonCreate(true);
      })
      .catch((error) => {
        alert("มีบางอย่างผิดพลาด หรือมีผู้ใช้ในระบบแล้ว");
        console.log(error);
        setStatusValidation([]);
        setIsModalVisible({ create: false, edit: false });
        setLoading(false);
        formCreate.resetFields();
        reload();
        setButtonCreate(true);
      });
  };
  const onFinishEdit = async (value) => {
    try {
      let filterRoles = await roles.find(
        (data) => data.roles_name === value.roles_id
      );
      let resp = await Api.put("/system/updateRoleUser", {
        id: dataEdit.id,
        roles_id:filterRoles.id,
      });
      alert("เปลี่ยนกลุ่มผู้ใช้งานเรียบร้อยแล้ว");
      reload();
      handleCancel()
    } catch (error) {
      console.log(error);
      alert("มีบางอย่างผิดพลาด");
    }
  };
  const onSearch = async (value) => {
    Api.get(`/system/findUserAD?username=${value}`)
      .then((data) => {
        setStatusValidation({
          help: "พบรหัสผู้ใช้ใน AD",
        });
        setButtonCreate(false);
      })
      .catch((error) => {
        console.log(error);
        setButtonCreate(true);
        setStatusValidation({
          validateStatus: "error",
          help: "ไม่พบรหัสผู้ใช้ใน AD ",
        });
      });
  };
  const handleEdit = async (id) => {
    let filterData = await data.find((data) => data.id === id);
    setDataEdit(filterData);
    showModal("edit");
  };
  const handleDelete = async (id) => {
    try {
      const resp = await Api.post("/system/delUserAD/" + id);
      console.log(resp);
      alert("ลบข้อมูลเรีนยร้อยแล้ว");
      reload()
    } catch (error) {
      console.log(error);
      alert("มีบางอย่างผิดพลาด");
    }
  };
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
            <h3 className="mb-4">จัดการผู้ใช้งานระบบ</h3>
          </Col>
          <Col span={5}>
            <Search
              placeholder="input search text"
              onSearch={(search) => {
                reload(search);
              }}
            />
          </Col>
          <Col span={5}>
            <Button
              onClick={() => {
                reload();
              }}
            >
              <RedoOutlined />
            </Button>
          </Col>
          <Col span={3} offset={11}>
            <Button
              type="primary"
              onClick={() => showModal("create")}
              style={{ float: "right" }}
            >
              + เพิ่มผู้ใช้ระบบ
            </Button>
          </Col>
          <Col span={24}>
            <div className="table-responsive">
              <Table
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
        title="เพิ่มผู้ใช้ระบบ"
        visible={isModalVisible.create}
        onOk={() => handleOk("formCreate")}
        onCancel={handleCancel}
        okButtonProps={{ disabled: buttonCreate }}
      >
        <Form
          form={formCreate}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishCreate}
          initialValues={{
            roles_id: "Editor",
          }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
            {...statusValidation}
          >
            <Search
              placeholder="+Username"
              enterButton="ค้นหา"
              onSearch={onSearch}
            />
          </Form.Item>
          <Form.Item
            name="roles_id"
            label="กลุ่มผู้ใช้งาน"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล กลุ่มผู้ใช้งาน" },
            ]}
          >
            <Select placeholder="กลุ่มผู้ใช้งาน" defaultValue="Editor">
              {roles.map((data, index) => (
                <Option key={index} value={data.roles_name}>
                  {data.roles_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="แก้ไขผู้ใช้"
        visible={isModalVisible.edit}
        onOk={() => handleOk("formEdit")}
        onCancel={handleCancel}
      >
        <Form
          form={formEdit}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
          initialValues={{
            user_name: dataEdit.user_name,
            roles_id: dataEdit.roles_name,
          }}
        >
          <Form.Item label="รหัสผู้ใช้ (AD)" name="user_name">
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            name="roles_id"
            label="กลุ่มผู้ใช้งาน"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล กลุ่มผู้ใช้งาน" },
            ]}
          >
            <Select
              placeholder="กลุ่มผู้ใช้งาน"
              defaultValue={dataEdit.roles_name}
            >
              {roles.map((data, index) => (
                <Option key={index} value={data.roles_name}>
                  {data.roles_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default usersSystemPage;
