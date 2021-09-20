import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { MoreOutlined } from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Input,
  Radio,
  Button,
  DatePicker,
  Select,
  Upload,
  Table,
  Modal,
  Dropdown,
  Menu,
} from "antd";
import Api from "../../../../util/Api";
import { UploadOutlined, RedoOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Search } = Input;
const SatelliteAerialPhotographsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [typePhoto, setTypePhoto] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      title: "layer_name",
      dataIndex: "layer_name",
      sorter: (record1, record2) => {
        return record1.user_name > record2.user_name;
      },
    },
    {
      key: "3",
      title: "wms",
      dataIndex: "wms",
      sorter: (record1, record2) => {
        return record1.firstlast > record2.firstlast;
      },
    },
    {
      key: "4",
      title: "url",
      dataIndex: "url",
      sorter: (record1, record2) => {
        return record1.e_mail > record2.e_mail;
      },
    },
    {
      key: "5",
      title: "wms_url",
      dataIndex: "wms_url",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "6",
      title: "type_server",
      dataIndex: "type_server",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "7",
      title: "date",
      dataIndex: "date",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "8",
      title: "config",
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" onClick={() => editHandle(id)}>
                  แก้ไข
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() => {
                    deleteHandle(id);
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
    setLoading(true);
    const data = {
      group_layer_id: value.typename,
      wms: value.nameWms,
      url: value.url,
      layer_name: value.layerName,
      type_server: value.typeserver,
      wms_url: value.wms_url,
      // upload: value.upload[0],
      date: value["date"].format("YYYY-MM-DD"),
    };
    Api.post("/masterdata/datLayers", data)
      .then((data) => {
        setIsModalVisible(false);
        setLoading(false);
        reload();
        form.resetFields();
      })
      .catch((error) => console.log(error));
  };

  const search = async (value) => {
    alert("ยังไม่ได้ทำ");
  };
  const reload = async () => {
    try {
      const resTypePhoto = await Api.post("/masterdata/getmasLayers");
      setTypePhoto(resTypePhoto.data.items);
      const respData = await Api.get("/masterdata/datLayers");
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
    }
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const deleteHandle = (id) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล")) {
      Api.delete("/masterdata/datLayers", { data: { id: id } })
        .then((data) => {
          alert("ลบข้อมูลเรียบร้อย");
          setLoading();
        })
        .catch((error) => alert("มีบางอย่างผิดพลาด ไม่สามารถลบข้อมูลได้"));
    }
  };
  const editHandle = () => {
    alert("ยังไม่ได้ทำ");
  };
  useEffect(() => {
    reload();
  }, loading);
  return (
    <>
      <Head>
        <title>จัดการ ภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ</title>
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
            <h3>จัดการ ภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ</h3>
          </Col>
          <Col span={5}>
            <Search placeholder="input search text" onSearch={search} />
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
              onClick={showModal}
            >
              + เพิ่มภาพถ่าย
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
          title="เพิ่มผู้ใช้ระบบ"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          centered
        >
          <Form
            form={form}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 14 }}
            onFinish={onFinish}
          >
            <Form.Item
              name="typename"
              label="ประเภทของภาพ"
              rules={[{ required: true }]}
            >
              <Select placeholder="ประเภทของภาพ">
                {typePhoto.map((data) => (
                  <Option value={data.id}>{data.group_name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="nameWms"
              label="ชื่อข้อมูล (WMS)"
              rules={[{ required: true }]}
            >
              <Input placeholder="ชื่อข้อมูล (WMS)" />
            </Form.Item>
            <Form.Item name="url" label="Url" rules={[{ required: true }]}>
              <Input placeholder="Url" />
            </Form.Item>
            <Form.Item
              name="wms_url"
              label="wms_url"
              rules={[{ required: true }]}
            >
              <Input placeholder="wms_url" />
            </Form.Item>
            <Form.Item
              name="layerName"
              label="Layer Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Layer Name" />
            </Form.Item>
            <Form.Item
              name="upload"
              label="Upload"
              rules={[{ required: true }]}
              extra="ขนาดที่ recommend 80x80 pixcel"
              getValueFromEvent={normFile}
            >
              <Upload name="logo" maxCount={1}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="typeserver"
              label=" "
              wrapperCol={{ span: 12 }}
              rules={[{ required: true }]}
            >
              <Radio.Group>
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
      </System>
    </>
  );
};

export default SatelliteAerialPhotographsPage;
