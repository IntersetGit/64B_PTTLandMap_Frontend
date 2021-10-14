import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { MoreOutlined } from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Input,
  Button,
  Table,
  Modal,
  Dropdown,
  Menu,

} from "antd";
import Api from "../../../../util/Api";
import { RedoOutlined } from "@ant-design/icons";
import { InputNumber } from 'antd';
//const { Option } = Select;
const { Search } = Input;

const index = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState([])
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState({
    create: false,
    edit: false,
  });
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [setMenuItem] = useState([]);
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [form] = Form.useForm();
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      dataIndex: "number",
      width: '3%',
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
    },
    {
      key: "2",
      title: "Status code",
      dataIndex: "status_code",
      width: '15%',
      sorter: (record1, record2) => {
        return record1.Status_code > record2.Status_code;
      },
    },
    {
      key: "3",
      title: "Status",
      dataIndex: "name",
      width: '30%',
      sorter: (record1, record2) => {
        return record1.Status > record2.Status;
      },
    },
    {
      key: "4",
      title: "จัดการ",
      dataIndex: "id",
      width: '2%',
      align: 'center',
      render: (id, show) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => {
                    handleEdit(show);
                  }}
                >
                  แก้ไข
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() => {
                    handleDelete(id);
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

  const [id, setId] = useState(null)
  const onFinishCreate = async (value) => {
    setLoading(true);
    console.log(`value`, value)

    setLoading(true);
    Api.post("/masterdata/masStatusProject", { ...value, id })
      .then(async (data) => {
        setIsModalVisible({ create: false, edit: false });
        reload();
        setLoading(false);
        formCreate.resetFields();
        await Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
        window.location.reload();
        setId(null)
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setId(null)
      });

  };

  const handleOk2 = () => {
    form.submit();
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    form.resetFields();
  };

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
          let resp = await Api.post("masterdata/masStatusProject", {
            ...data,
            id: form.getFieldValue().id,
          });
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
          const resp = await Api.delete(`masterdata/masStatusProject?id=` + id);
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

  // const handleEdit = async (id) => {
  //   console.log(`id`, id);
  //   setIsModalVisible({ ...isModalVisible, create: true });
  //   const { data } = await Api.post("/masterdata/masStatusProject")

  // };

  const reload = async (search = null) => {
    setLoading(true);
    try {
      const respData = await Api.get(
        `/masterdata/masStatusProject${search != null ? "?search=" + search : ""}`
      );

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
        <title>จัดการ Status โครงการ</title>
      </Head>
      <Row
        gutter={[10, 10]}
        style={{
          background: "white",
          padding: "16px",
          // width: '100%',
          boxShadow:
            " rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
        }}
      >
        <Col span={24}>
          <h3>จัดการ Status โครงการ</h3>{dataEdit.layer_name}
        </Col>
        <Col xs={8} sm={8} md={8} lg={8} xl={5} xxl={5}>
          <Search
            placeholder="input search text"
            onSearch={(e) => {
              reload(e);
            }}
          />
        </Col>
        <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={11}>
          <Button onClick={() => reload()}>
            <RedoOutlined />
          </Button>
        </Col>
        <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={8} >
          <Button
            type="primary"
            style={{ float: "right" }}
            onClick={() => showModal("create")}
          >
            + เพิ่ม Status
          </Button>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
        </Col>
      </Row>

      <Modal
        title="จัดการ Status"
        visible={isModalVisible.create}
        onOk={() => handleOk("formCreate")}
        onCancel={handleCancel}
        centered
      >
        <Form
          colon={false}
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
        >

          <Form.Item
            name="status_code"
            label="Status Code"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={10} defaultValue={1} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Status"
            rules={[{ required: true }]}
          >
            <Input placeholder="Status" />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        title="แก้ไข Status"
        visible={isModalVisible2}
        onOk={handleOk2}
        onCancel={handleCancel2}
      >
        <Form
          colon={false}
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
        >

          <Form.Item
            name="status_code"
            label="Status Code"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={10} defaultValue={1} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Status"
            rules={[{ required: true }]}
          >
            <Input placeholder="Status" />
          </Form.Item>

        </Form>
      </Modal>

    </System>
  );
};

export default index;
