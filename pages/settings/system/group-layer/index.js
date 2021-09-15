import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { MoreOutlined, RedoOutlined, UploadOutlined } from "@ant-design/icons";
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
} from "antd";
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
      title: "Symbol",
      dataIndex: "Symbaol",
      sorter: (record1, record2) => {
        return record1.Symbaol > record2.Symbaol;
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
      render: (id) => {
        return <MoreOutlined />;
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
            <h3>จัดการ Group Layer</h3>
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
        <Form labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="groupLayer"
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
          extra="ขนาดที่ recommend 50*50 pixcel"
        >  
          <Upload name="logo" action="/upload.do" listType="picture">
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupLayerSystemPage;
