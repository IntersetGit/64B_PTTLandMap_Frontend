// import Head from "next/head";
// import System from "../../../../components/_App/System";
// import { Row, Col } from "antd";



// const index = () => {
  
  
  
  
  
//   return (
//     <>
//       <Head>
//         <title>จัดการ Status โครงการ</title>
//       </Head>
//       <System>
//         <Row
//           gutter={[10, 10]}
//           style={{
//             background: "white",
//             padding: "16px",
//             boxShadow:
//               " rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//           }}
//         >
//           <Col span={24}>
//             <h3 className="mb-4">จัดการ Status โครงการ</h3>
//           </Col>
//         </Row>
//       </System>
//     </>
//   );
// };

// export default index;
import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import System from "../../../../components/_App/System";
import moment from "moment";
import Swal from "sweetalert2";
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
import { InputNumber } from 'antd';
const { Option } = Select;
const { Search } = Input;

const index = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataEdit,setDataEdit]=useState([])
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
      title: "Status_code",
      dataIndex: "Status_code",
      sorter: (record1, record2) => {
        return record1.Status_code > record2.Status_code;
      },
    },
    {
      key: "3",
      title: "Status",
      dataIndex: "Status",
      sorter: (record1, record2) => {
        return record1.Status > record2.Status;
      },
    },
    {
      key: "4",
      title: "จัดการ",
      dataIndex: "id",
      render: (id) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => {
                    showModal("edit"),handleEdit(id);
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
      wms_url: value.wms_url,
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
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };
  const onFinishEdit = (value) => {
        const data = {
          id: value.id,
          image_type: value.image_type,
          layer_name: value.layerName??null,
          type_server: value.typeserver,
          wms_url: value.wms_url,
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
            setIsModalVisible({create:false,edit:false});
            setLoading(false);
            reload();
            // window.location.reload()
            formEdit.resetFields();
          })
          .catch((error) => console.log(error));
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
  const handleEdit = (id)=>{
    let filterData =  data.find((data) => data.id === id);
    setDataEdit(filterData);
    console.log(filterData)
  }
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
        onOk={()=>handleOk("formCreate")}
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
            name="Status Code"
            label="Status Code"
            rules={[{ required: true }]}
          >
            {/* <Input placeholder="Username" /> */}
            <InputNumber min={1} max={10} defaultValue={3}  />
          </Form.Item>
          <Form.Item
            name="Status"
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
