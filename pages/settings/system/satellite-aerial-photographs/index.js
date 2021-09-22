import { useState, useEffect } from "react";
import axios from 'axios'
import Head from "next/head";
import System from "../../../../components/_App/System";
import moment from "moment";
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
  const [dataEdit, setDataEdit] = useState([]);
  const [typePhoto, setTypePhoto] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal2Visible, setIsModal2Visible] = useState(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
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
      title: "img",
      dataIndex: "id",
      render: (id) => {
        return <img width={80} height={80} src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${id}.jpg`} />
      }
    },
    {
      key: "3",
      title: "layer_name",
      dataIndex: "layer_name",
      sorter: (record1, record2) => {
        return record1.user_name > record2.user_name;
      },
    },
    {
      key: "4",
      title: "wms",
      dataIndex: "wms",
      sorter: (record1, record2) => {
        return record1.firstlast > record2.firstlast;
      },
    },
    {
      key: "5",
      title: "url",
      dataIndex: "url",
      sorter: (record1, record2) => {
        return record1.e_mail > record2.e_mail;
      },
    },
    {
      key: "6",
      title: "wms_url",
      dataIndex: "wms_url",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "7",
      title: "type_server",
      dataIndex: "type_server",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "8",
      title: "date",
      dataIndex: "date",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "9",
      title: "config",
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" onClick={() => showModal2(id)}>
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
  const showModal2 = async (id) => {
    let filterData = await data.find((data) => data.id === id);
    setDataEdit(filterData);
    setIsModal2Visible(true);
  };
  const handleOk = () => {
    form.submit();
  };
  const handleOk2 = () => {
    form2.submit();
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleCancel2 = () => {
    setIsModal2Visible(false);
    form2.resetFields();
  };
  const onFinish = (value) => {
    setLoading(true);
    const data = {
      image_type: value.typename,
      layer_name: value.layerName??null,
      type_server: value.typeserver,
      wms_url: value.wms_url,
      date: value["date"].format("YYYY-MM-DD"),
    };
    console.log(data)
    let fd = new FormData();
    fd.append("file0", value.upload[0].originFileObj)
    Api.post("/masterdata/datLayers", data)
      .then(async (data) => {
        setIsModalVisible(false);
        setLoading(false);
        reload();
        form.resetFields();
        const upload = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=satellite-aerial-photographs&Length=1&Name=${data.data.items.id}&SetType=jpg`, fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      })
      .catch((error) =>{
        console.log(error)
        setLoading(false)
      });
  };
  const onFinish2 = (value) => {
    const data = {
      id: value.id,
      group_layer_id: value.typename,
      wms: value.nameWms,
      url: value.url,
      layer_name: value.layerName,
      type_server: value.typeserver,
      wms_url: value.wms_url,
      upload: value.upload[0],
      date: value["date"].format("YYYY-MM-DD"),
    };
    let fd = new FormData()
    fd.append("file0", value.upload[0].originFileObj)
    Api.put("/masterdata/datLayers", data)
      .then(async (data) => {

        const upload = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=satellite-aerial-photographs&Length=1&Name=${value.id}&SetType=jpg`, fd
          ,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        setIsModal2Visible(false);
        setLoading(false);
        reload();
        window.location.reload()
        form2.resetFields();
      })
      .catch((error) => console.log(error));
  };


  const search = async (value) => {
    try {
      const respData = await Api.get("/masterdata/datLayers?search=" + value)
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
      console.log(error)
    }
  };
  const reload = async () => {
    try {
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

  const [menuItem, setMenuItem] = useState([])

  const geoServerAndImageServer = () => {
    return (
      <>
        <Form.Item
          name="layerName"
          label="Layer Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Layer Name" />
        </Form.Item>
      </>
    )
  }
  const changeTypeServer = (e) => {
    const type = e.target.value
    setMenuItem([])
    if (type !== 'arcgisserver') {
      setMenuItem(geoServerAndImageServer)
    }
  }

  useEffect(() => {
    reload();
  }, [loading]);
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
          title="เพิ่มภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ"
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

                <Option value="ภาพถ่ายจากดาวเทียม">ภาพถ่ายจากดาวเทียม</Option>
                <Option value="ภาพถ่ายทางอากาศจากโดรน">ภาพถ่ายทางอากาศจากโดรน</Option>

              </Select>
            </Form.Item>
            <Form.Item
              name="wms_url"
              label="wms_url"
              rules={[{ required: true }]}
            >
              <Input placeholder="wms_url" />
            </Form.Item>
            {menuItem}
            <Form.Item
              name="upload"
              label="Upload"
              rules={[{ required: true }]}
              extra="ขนาดที่ recommend 80x80 pixcel"
              getValueFromEvent={normFile}
            >
              <Upload  maxCount={1}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="typeserver"
              label=" "
              wrapperCol={{ span: 12 }}
              rules={[{ required: true }]}
            >
              <Radio.Group  onChange={(e) => { changeTypeServer(e) }}>
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

        {/* <Modal
          title="แก้ไข ภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ"
          visible={isModal2Visible}
          onOk={handleOk2}
          onCancel={handleCancel2}
          centered
        >
          <Form
            form={form2}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 14 }}
            onFinish={onFinish2}
            initialValues={{
              id: dataEdit.id,
              nameWms: dataEdit.wms,
              wms_url: dataEdit.wms_url,
              layerName: dataEdit.layer_name,
              url: dataEdit.url,
              date: moment(dataEdit.date),
              typeserver: dataEdit.type_server,
              typename: dataEdit.group_layer_id
            }}
          >
            <Form.Item
              name="id"
              label="id"
              hidden
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="typename"
              label="ประเภทของภาพ"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="ประเภทของภาพ"
              >
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
              <Upload maxCount={1}>
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
        </Modal> */}
      </System>
    </>
  );
};

export default SatelliteAerialPhotographsPage;
