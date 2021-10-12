import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
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
  Image,
} from "antd";
import Api from "../../../../util/Api";
import { UploadOutlined, RedoOutlined } from "@ant-design/icons";
const { Option } = Select;
const { Search } = Input;
const index = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState({
    create: false,
    edit: false,
  });
  const [menuItem, setMenuItem] = useState([]);
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
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
      title: "รูปภาพ",
      dataIndex: "id",
      render: (id) => {
        return (
          <Image
            width={50}
            height={50}
            preview={true}
            src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${id}.jpg`}
          />
        );
      },
    },
    {
      key: "3",
      title: "Layer Name",
      dataIndex: "layer_name",
      sorter: (record1, record2) => {
        return record1.user_name > record2.user_name;
      },
    },
    {
      key: "4",
      title: "ชื่อข้อมูล (WMS)",
      dataIndex: "wms",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "ถ",
      title: "Type Server",
      dataIndex: "type_server",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "6",
      title: "Date",
      dataIndex: "date",
      sorter: (record1, record2) => {
        return record1.roles_name > record2.roles_name;
      },
    },
    {
      key: "7",
      title: "จัดการ",
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={async () => {
                    await handleEdit(id),
                      await handleCancel(),
                      await handleEdit(id);
                  }}
                >
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
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
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
  const onFinishCreate = (value) => {
    setLoading(true);
    const data = {
      image_type: value.typename,
      layer_name: value.layerName ?? null,
      type_server: value.typeserver,
      wms: value.wms,
      url: value.url,
      date: value["date"].format("YYYY-MM-DD"),
    };
    let fd = new FormData();
    fd.append("file0", value.upload[0].originFileObj);
    Api.post("/masterdata/datLayers", data)
      .then(async (data) => {
        setIsModalVisible({ create: false, edit: false });
        reload();
        setLoading(false);
        formCreate.resetFields();
        const upload = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=satellite-aerial-photographs&Length=1&Name=${data.data.items.id}&SetType=jpg`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        await Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };
  const onFinishEdit = async (value) => {
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
          const data = {
            id: value.id,
            image_type: value.image_type,
            layer_name: value.layerName ?? null,
            type_server: value.typeserver,
            wms: value.wms,
            url: value.url,
            date: value["date"].format("YYYY-MM-DD"),
          };
          const fd = new FormData();
          const respData = await Api.put("/masterdata/datLayers", data);
          if (!!value.upload) {
            fd.append("file0", value.upload[0].originFileObj);
            const respImage = await axios.post(
              `${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=satellite-aerial-photographs&Length=1&Name=${value.id}&SetType=jpg`,
              fd,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }
          setIsModalVisible({ create: false, edit: false });
          setLoading(false);
          await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
          window.location.reload();
          formEdit.resetFields();
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };
  const deleteHandle = (id) => {
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
          setLoading(true);
          const resp = await Api.delete("/masterdata/datLayers", {
            data: { id: id },
          });
          Swal.fire("", "ลบข้อมูลเรียบร้อยแล้ว", "success");
          reload();
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด ไม่สามารถลบข้อมูลได้", "error");
      setLoading(false);
    }
  };
  const handleEdit = async (id) => {
    let filterData = await data.find((data) => data.id === id);
    setDataEdit(filterData);
    showModal("edit");
    $(window).ready(function () {
      $(`#arcgisserver`).click();
      $(`#imageserver`).click();
      $(`#${filterData.type_server}`).click();
    });
  };
  const changeTypeServer = (e) => {
    const type = e.target.value;
    setMenuItem([]);
    if (type !== "arcgisserver") {
      setMenuItem(
        <>
          <Form.Item
            name="layerName"
            label="Layer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Layer Name" />
          </Form.Item>
        </>
      );
    }
  };
  const reload = async (search = null) => {
    try {
      const respData = await Api.get(
        `/masterdata/datLayers${search != null ? "?search=" + search : ""}`
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
        <title>จัดการ ภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ</title>
      </Head>
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
            + เพิ่มภาพถ่าย
          </Button>
        </Col>
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

      <Modal
        title="เพิ่มภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ"
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
            name="typename"
            label="ประเภทของภาพ"
            rules={[{ required: true }]}
          >
            <Select placeholder="ประเภทของภาพ">
              <Option value="ภาพถ่ายจากดาวเทียม">ภาพถ่ายจากดาวเทียม</Option>
              <Option value="ภาพถ่ายทางอากาศจากโดรน">
                ภาพถ่ายทางอากาศจากโดรน
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="wms"
            label="ชื่อข้อมูล (WMS)"
            rules={[{ required: true }]}
          >
            <Input placeholder="wms_url" />
          </Form.Item>
          <Form.Item name="url" label="url" rules={[{ required: true }, { type: "url" }]}>
            <Input placeholder="url" />
          </Form.Item>
          {menuItem}
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
            <Radio.Group
              onChange={(e) => {
                changeTypeServer(e);
              }}
            >
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

      <Modal
        title="แก้ไข ภาพถ่ายดาวเทียม และภาพถ่ายทางอากาศ"
        visible={isModalVisible.edit}
        onOk={() => {
          handleOk("formEdit");
        }}
        onCancel={handleCancel}
        centered
      >
        <Form
          form={formEdit}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
          initialValues={{
            id: dataEdit.id,
            nameWms: dataEdit.wms,
            wms: dataEdit.wms,
            url: dataEdit.url,
            layerName: dataEdit.layer_name,
            date: moment(dataEdit.date),
            typeserver: dataEdit.type_server,
            type_name: dataEdit.image_type,
          }}
        >
          <Form.Item name="id" label="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="type_name"
            label="ประเภทของภาพ"
            rules={[{ required: true }]}
          >
            <Select placeholder="ประเภทของภาพ">
              <Option value="ภาพถ่ายจากดาวเทียม">ภาพถ่ายจากดาวเทียม</Option>
              <Option value="ภาพถ่ายทางอากาศจากโดรน">
                ภาพถ่ายทางอากาศจากโดรน
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="wms"
            label="ชื่อผู้ใช้ (WMS)"
            rules={[{ required: true }]}
          >
            <Input placeholder="wms_url" />
          </Form.Item>
          <Form.Item name="url" label="url" rules={[{ required: true }, { type: "url" }]}>
            <Input placeholder="wms_url" />
          </Form.Item>
          {menuItem}
          <Form.Item
            name="upload"
            label="Upload"
            extra="ขนาดที่ recommend 80x80 pixcel"
            getValueFromEvent={normFile}
          >
            <Upload
              maxCount={1}
              defaultFileList={[
                {
                  name: `${dataEdit.id}.jpg`,
                  url: `${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${dataEdit.id}.jpg`,
                },
              ]}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="typeserver"
            label=" "
            wrapperCol={{ span: 12 }}
            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => {
                changeTypeServer(e);
              }}
            >
              <Radio value="arcgisserver" id="arcgisserver">
                ArcGIS Server
              </Radio>
              <Radio value="imageserver" id="imageserver">
                Image Server
              </Radio>
              <Radio value="geoserver" id="geoserver">
                Geoserver
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </System>
  );
};

export default index;
