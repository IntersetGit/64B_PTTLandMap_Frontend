import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
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
    console.log(value);
    let fd = new FormData();
    //console.log(value.Symbol[0].originFileObj)
    fd.append("file0", value.Symbol[0].originFileObj);
    Api.post("/masterdata/masLayers", { group_name: value.groupLayer })
      .then(async (data) => {
        reload();
        const upload = await axios.post(
          `http://localhost:9000/upload?Path=symbol_group&Length=1&Name=${data.data.items.id}&SetType=jpg`,
          fd
        );
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
      dataIndex: "order_by",
      width: 100,
      sorter: (record1, record2) => {
        return record1.order_by > record2.order_by;
      },
    },
    {
      title: "Symbol",
      dataIndex: "id",
      render: (id) => {
        // return <MoreOutlined />
        return (
          <img
            width={50}
            height={50}
            src={`http://localhost:9000/uploads/symbol_group/${id}.jpg`}
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
  //     render: (id) => {
  //       // return <MoreOutlined />
  //       return (
  //         <Dropdown.Button
  //           overlay={menu}
  //           icon={<MoreOutlined />}
  //         ></Dropdown.Button>
  //       );
  //     },
  //   },
  // ];

  // const showDrop = async (items) => {
  //   Dropdown("show", items);
  // };
  render: (id) => {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="1">แก้ไข</Menu.Item>
            <Menu.Item key="2">ลบ</Menu.Item>
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
        <Row gutter={[20, 20]} style={{ background: "white", padding: "50px" }}>
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
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          colon={false}
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
            label="Sybol"
            valuePropName="fileList"
            rules={[{ required: true }]}
            getValueFromEvent={normFile}
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
