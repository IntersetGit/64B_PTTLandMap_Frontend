import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import {  RedoOutlined } from "@ant-design/icons";
import { Table, Modal, Input, Row, Col, Button, Form } from "antd";
import Api from "../../../../util/Api";
const { Search } = Input;

const GroupLayerSystemPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const onFinish = async (value) => {
    Api.post("/masterdata/masLayers", { group_name: value.groupLayer })
      .then((data) => {
        reload();
      })
      .catch((error) => {
        console.log(error);
      });
    form.resetFields();
  };
  const reload = () => {
    Api.post("/masterdata/getmasLayers")
      .then((data) => {
        setData(data.data.items);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "order_by",
      sorter: (record1, record2) => {
        return record1.order_by > record2.order_by;
      },
    },
    {
      title: "group Layer",
      dataIndex: "group_name",
      sorter: (record1, record2) => {
        return record1.group_name > record2.group_name;
      },
    },
  ];

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
              { required: true, message: "Please input your grouplayer!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupLayerSystemPage;
