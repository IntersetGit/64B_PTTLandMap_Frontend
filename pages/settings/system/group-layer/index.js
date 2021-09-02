import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { RedoOutlined } from "@ant-design/icons";
import { Table, Input, Row, Col, Button, Modal, Form } from "antd";
import Api from "../../../../util/Api";
const { Search } = Input;

const GroupLayerSystemPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    reload();
  }, []);
  const reload = () => {
    Api.post("/masterdata/getMasLayers").then((data) => {
      setData(data.data.items);
    });
  };
  const columns = [
    {
      key:"1",
      title: "ลำดับ",
      dataIndex: "order_by",
      sorter:(record1,record2)=>{
        return record1.order_by>record2.order_by
      }
    },
    {
      key:"2",
      title: "group Layer",
      dataIndex: "group_name",
      sorter:(record1,record2)=>{
        return record1.group_name>record2.group_name
      }
    },
    {
      key:"3",
      title: "ความหมาย",
      dataIndex: "mean",
      sorter:(record1,record2)=>{
        return record1.mean>record2.mean
      }
    },
  ];

  const search = (value) => {
    Api.post("/masterdata/getMasLayers", { search: value }).then((data) => {
      setData(data.data.items);
    });
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
  const onFinish = (value) => {
    console.log(value);
    form.resetFields();
    setIsModalVisible(false);
  };
  return (
    <>
      <Head>
        <title>จัดการ Group Layer</title>
      </Head>
      <System>
        <Row gutter={[10, 10]} style={{ background: "white", padding: "16px" }}>
          <Col span={24}>
            <h3>จัดการผู้ใช้งานระบบ</h3>
          </Col>
          <Col span={5}>
            <Search placeholder="input search text" onSearch={search} />
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
            <Button type="primary" onClick={showModal}>
              + เพิ่ม group
            </Button>
          </Col>
          <Col span={24}>
            <Table
              size="middle"
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
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="groupLayer"
            label="Group Layer"
            rules={[
              { required: true, message: "Please input your Group Layer!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="mean"
            label="ความหมาย"
            rules={[{ required: true, message: "Please input your Mean!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupLayerSystemPage;
