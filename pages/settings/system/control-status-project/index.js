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
  const [setMenuItem] = useState([]);
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      dataIndex: "number",
      width: '5%',
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
      width: '25%',
      sorter: (record1, record2) => {
        return record1.Status > record2.Status;
      },
    },
    {
      key: "4",
      title: "จัดการ",
      dataIndex: "id",
      width: '10%',
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => {
                    console.log(`id`, id)
                    handleEdit(id);
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

  // const deleteHandle = (id) => {
  //   try {
  //     Swal.fire({
  //       title: "กรุณายืนยันการลบข้อมูล?",
  //       text: "เมื่อยืนยันแล้วจะไม่สามารถเรียกคืนได้",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#218838",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "ยืนยัน",
  //       cancelButtonText: "ยกเลิก",
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         setLoading(true);
  //         const resp = await Api.delete("/masterdata/masStatusProject?id", {
  //           data: { id: id },
  //         });
  //         Swal.fire("", "ลบข้อมูลเรียบร้อยแล้ว", "success");
  //         reload();
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     Swal.fire("", "มีบางอย่างผิดพลาด ไม่สามารถลบข้อมูลได้", "error");
  //     setLoading(false);
  //   }
  // };
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

  const handleEdit = async (id) => {
    console.log(`id`, id);
    setIsModalVisible({ ...isModalVisible, create: true });
    const { data } = await Api.post("/masterdata/masStatusProject")

  };

  const reload = async (search = null) => {
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
          width: '70%',
          boxShadow:
            " rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
        }}
      >
        <Col span={24}>
          <h3>จัดการ Status โครงการ</h3>{dataEdit.layer_name}
        </Col>
        <Col span={5}>
          <Search
            placeholder="input search text"
            onSearch={(e) => {
              reload(e);
            }}
          />
        </Col>
        <Col span={5}>
          <Button onClick={() => reload()}>
            <RedoOutlined />
          </Button>
        </Col>
        <Col span={3} offset={11}>
          <Button
            type="primary"
            style={{ float: "right" }}
            onClick={() => showModal("create")}
          >
            + เพิ่ม Status
          </Button>
        </Col>
        <Col span={24}>
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
          form={formCreate}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishCreate}
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
