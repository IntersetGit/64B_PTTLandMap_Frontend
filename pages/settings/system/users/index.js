import { useState, useEffect } from "react";
import Swal from "sweetalert2";
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
      title: <b>ลำดับ</b>,
      dataIndex: "number",
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
    },
    {
      key: "2",
      title: <b>ชื่อเข้าใช้ระบบ</b>,
      dataIndex: "user_name",
      sorter: (record1, record2) => {
        return record1.user_name > record2.user_name;
      },
    },
    {
      key: "3",
      title: <b>ชื่อ-นามสกุล</b>,
      dataIndex: "firstlast",
      sorter: (record1, record2) => {
        return record1.firstlast > record2.firstlast;
      },
    },
    {
      key: "4",
      title: <b>อีเมล</b>,
      dataIndex: "e_mail",
      sorter: (record1, record2) => {
        return record1.e_mail > record2.e_mail;
      },
    },
    {
      key: "5",
      title: <b>กลุ่มผู้ใช้งาน</b>,
      dataIndex: "roles_name",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "6",
      title: <b>แหล่งทที่มาจากผู้ใช้</b>,
      dataIndex: "is_ad",
      render: (item1, item2) => item1 ? "AD" : <span style={{ color: "red" }}>Non AD</span>
    },
    {
      key: "7",
      title: <b>จัดการ</b>,
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={async () => {
                    await handleCancel();
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
      is_ad: true
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
  const onFinishEdit = async (value) => {
    try {
      let filterRoles = await roles.find(
        (data) => data.roles_name === value.roles_id
      );
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
          let resp = await Api.put("/system/updateRoleUser", {
            id: dataEdit.id,
            roles_id: filterRoles.id,
          });
          await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
          reload();
          handleCancel();
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };
  const onSearch = async (value) => {
    setStatusValidation({
      help: `กำลังโหลดข้อมูล...`,
    });
    Api.get(`/system/findUserAD?username=${value}`)
      .then((data) => {
        setStatusValidation({
          help: `${data.data.items.displayName}`,
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
    setIdUser(id)
    if (filterData.is_ad) {
      setDataEdit(filterData);
      showModal("edit");
    } else {
      setMode("edit")
      setIsModalVisibleAS(true)
      filterData.username = filterData.user_name
      formAD.setFieldsValue(filterData)
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
          const resp = await Api.post("/system/delUserAD/" + id);
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


  /**
   * โหมด add , edit , view
   * @type {String} mode
   */
  const [mode, setMode] = useState("add")
  const [idUser, setIdUser] = useState(null)

  /**
   * เปิดปิด Modal AD
   * @type {Boolean} isModalVisibleAD
   */
  const [isModalVisibleAD, setIsModalVisibleAS] = useState(false);

  /**
   * form ของ AD
   */
  const [formAD] = Form.useForm();

  /**
   * กดตกลง modal AD
   */
  const handleOkAD = () => {
    formAD.submit()
  };

  /**
   * กดยกเลิก modal AD
   */
  const handleCancelAD = () => {
    formAD.resetFields()
    setIsModalVisibleAS(false)
    setIdUser(null)
  };


  /**
  * Submit Form
  * @param {{username: String, roles_id: String, first_name: String, last_name: String, e_mail: String}} value
  */
  const onFinishAD = async (value) => {
    try {
      // console.log('value :>> ', value);
      value.is_ad = false;
      if (mode == "edit") {
        value.id = idUser
        await Api.put("/system/editUser", value);
      } else {
        await Api.post("/system/addUserAD", value);
      }
      Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
      handleCancelAD()
      reload();
    } catch (error) {
      Swal.fire("", "มีบางอย่างผิดพลาด หรือมีผู้ใช้ในระบบแล้ว", "error");
    }
  };

  const onFinishFailedAD = (error) => {
    console.log('error :>> ', error);
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
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={5}>
            <Search
              placeholder="input search text"
              onSearch={(search) => {
                reload(search);
              }}
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
            <Row>
              <Col span={4} />
              <Col span={10} >
                <button className="btn btn-primary" style={{ float: "start" }} onClick={() => setIsModalVisibleAS(true)}>+ เพิ่มผู้ใช้ระบบนอก AD</button>
              </Col>
              <Col span={10} >
                <button className="btn btn-primary" style={{ float: "right" }} onClick={() => showModal("create")}>+ เพิ่มผู้ใช้ระบบจาก AD</button>
              </Col>

            </Row>
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
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
            {...statusValidation}
          >
            <Search
              placeholder="Username"
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
            <Select placeholder="กลุ่มผู้ใช้งาน" >
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


      {/*  */}
      <Modal
        title={`${mode == "add" ? "เพิ่ม" : mode == "edit" ? "แก้ไข" : "ดู"} ข้อมูลผู้ใช้ระบบนอก AD`}
        visible={isModalVisibleAD}
        onOk={handleOkAD}
        onCancel={handleCancelAD}
      >
        <Form
          form={formAD}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishAD}
          onFinishFailed={onFinishFailedAD}
          autoComplete="off"
        >
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล" },
            ]}>
            <Input disabled={mode != "add"} />
          </Form.Item>

          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่าน" },
              { min: 8, message: 'รหัสผ่านมีความยาวอย่างน้อย 8 ตัวอักษร' }
            ]}
            hasFeedback
          >
            <Input.Password disabled={mode == "view"} />
          </Form.Item>

          <Form.Item
            label="ยืนยันรหัสผ่าน"
            name="confirm_password"
            rules={[
              { required: true, message: "กรุณากรอกยืนยันรหัสผ่าน" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('ยืนยันรหัสผ่านไม่ตรงกัน!!'))
                }
              })
            ]}
            hasFeedback
          >
            <Input.Password disabled={mode == "view"} />
          </Form.Item>

          <Form.Item
            label="ชื่อจริง"
            name="first_name"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล" },
            ]}
          >
            <Input disabled={mode == "view"} />
          </Form.Item>

          <Form.Item
            label="นามสกุล"
            name="last_name"
          >
            <Input disabled={mode == "view"} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="e_mail"
          >
            <Input disabled={mode == "view"} />
          </Form.Item>

          <Form.Item
            name="roles_id"
            label="กลุ่มผู้ใช้งาน"
            rules={[
              { required: true, message: "กรุณาเลือกข้อมูล" },
            ]}
          >
            <Select
              placeholder="กลุ่มผู้ใช้งาน"
            >
              {roles.map((data, index) => (
                <Option key={index} value={data.id}>
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
