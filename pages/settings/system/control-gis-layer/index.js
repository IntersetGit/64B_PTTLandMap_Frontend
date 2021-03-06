import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Api from "../../../../util/Api";
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
  const [statusValidation, setStatusValidation] = useState([]);
  const [listGroup, setListGroup] = useState([]);
  const [dataEdit, setDataEdit] = useState([]);
  const [form] = Form.useForm();
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
      dataIndex: "id",
      render: (id,show) => {
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

  const [select, setSelect] = useState()

  const getgroup = () => {
    Api.post("masterdata/getMasLayers", { group_name :""})
      .then(async (data) => {
        setSelect(data.data.items)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const reload = () => {
    Api.get("masterdata/masLayersShape")
      .then(({ data: { items } }) => {
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
        console.log(error);
      });
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
        console.log("sdasd" , form.getFieldValue())
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    form.submit();
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const onFinish = async (value) => {
    setLoading(true);
    Api.post("/system/addUserAD", {
      username: value.username,
      roles_id: value.roles_id,
    })
      .then((data) => {
        setIsModalVisible(false);
        setLoading(false);
        reload();
        form.resetFields();
      })
      .catch((error) => {
        alert("มีบางอย่างผิดพลาด หรือมีผู้ใช้ในระบบแล้ว");
        setIsModalVisible(false);
        setLoading(false);
      });
    form.resetFields();
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
            <h3 className="mb-4">จัดการข้อมูล GIS Layer</h3>
          </Col>
          <Col span={5}>
            <Search placeholder="input search text" />
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
          {/* <Col span={3} offset={11}>
            <Button
              type="primary"
              onClick={showModal}
              style={{ float: "right" }}
            >
              + เพิ่มผู้ใช้ใหม่
            </Button>
          </Col> */}
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
            <Input  />
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
