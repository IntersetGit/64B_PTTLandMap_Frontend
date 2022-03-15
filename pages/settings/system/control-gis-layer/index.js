import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Api from "../../../../util/Api";
import Swal from "sweetalert2";
import { MoreOutlined, RedoOutlined, UploadOutlined } from "@ant-design/icons";
import { Cookies } from "react-cookie";
import axios from "axios";
import {
  Table,
  Input,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Select,
  Menu,
  Dropdown,
  InputNumber,
  Slider,
  Checkbox,
  Radio,
  DatePicker,
  Upload,
} from "antd";
import Color from "../../../../components/Color";
import moment from "moment";
const { Search } = Input;
const { Option } = Select;
const cookies = new Cookies();
const usersSystemPage = () => {
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [isModalVisible3, setIsModalVisible3] = useState(false);
  const [statusValidation, setStatusValidation] = useState([]);
  const [menuItem, setMenuItem] = useState([]);
  const [colorUpload, setColorUpload] = useState({
    hex: "red",
    rgb: { r: 255, g: 0, b: 0, a: 1 },
  });
  const [colorFrame, setColorFrame] = useState({
    hex: "#000000",
    rgb: { r: 0, g: 0, b: 0, a: 1 },
  });
  const [form] = Form.useForm();
  const [formCreate] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [form2] = Form.useForm();

  const [FileListSymbol, setFileListSymbol] = useState([]);
  const [FileUploadSymbol, setFileUploadSymbol] = useState(null);
  const [inputValueOpacityColor, setInputValueOpacityColor] = useState(0.5) //Opacity
  const [inputValueStrokColor, setInputValueStrokColor] = useState(1) //ความหนากรอบ
  const [configColor, setConfigColor] = useState(false)

  const [modalexport, setModalexport] = useState({ id: null, visible: false });

  // Drag Drop Table -----------------------------------------------------------------
  const type = 'DraggableBodyRow';
  const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
    const ref = useRef();
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: monitor => {
        const { index: dragIndex } = monitor.getItem() || {};
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
        };
      },
      drop: item => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type,
      item: { index },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));

    return (
      <tr
        ref={ref}
        className={`${className}${isOver ? dropClassName : ''}`}
        style={{ cursor: 'move', ...style }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };
  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      setLoading(true)
      let countPage = (page * pageSize) - pageSize
      const dragRow = data[countPage + dragIndex] //ข้อมูลที่คลิกลาก
      const hoverRow = data[countPage + hoverIndex] //ข้อมูลที่ลากวาง
      const result = {
        drag: dragRow,
        hover: hoverRow
      }
      let a = countPage + dragIndex    //  ตำแหน่งอาแรย์ที่คลิกลาก
      let b = countPage + hoverIndex  // ตำแหน่งอาเรย์ที่ลากวาง
      Api.post("masterdata/orderByGisLayer", result)
        .then(data => {
          reload()
        }).catch(error => {
          console.log(error)
        })
      // setData(
      //   update(data, {
      //     $splice: [
      //       [a, 1],
      //       [b, 0, dragRow],
      //     ],
      //   }),
      // );
    },
    [data],
  );

  const handleChangeSortTable = (value) => {
    value === 'all' ?
      setPageSize(data.length)
      : setPageSize(value)
  }

  // End Drag Drop Table--------------------------------------------------------------------------
  const columns = [
    {
      key: "1",
      title: <b>ลำดับ</b>,
      dataIndex: "number",
      sorter: (record1, record2) => {
        return record1.number > record2.number;
      },
    },
    {
      key: "2",
      title: <b>ชื่อ</b>,
      dataIndex: "name_layer",
      sorter: (record1, record2) => {
        return record1.name_layer > record2.name_layer;
      },
    },
    {
      key: "3",
      title: <b>Group Layer</b>,
      dataIndex: "group_name",
      sorter: (record1, record2) => {
        return record1.group_name.localeCompare(record2.group_name)
      },
    },
    {
      key: "4",
      title: <b>ประเภทไฟล์</b>,
      dataIndex: "type",
      sorter: (record1, record2) => {
        return record1.group_name > record2.group_name;
      },
    },
    {
      key: "5",
      title: <b>ประเภทข้อมูล GEOM</b>,
      dataIndex: "type_geo",
      render: (id, record) => (record.type_geo ?? "-")
    },
    {
      key: "6",
      title: <b>จัดการ</b>,
      // width: 200,
      dataIndex: "id",
      render: (id, show) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                {show.type === 'wms' ?
                  <Menu.Item
                    key="1"
                    onClick={() => (handleEditWMS(show))}
                  >
                    แก้ไข WMS
                  </Menu.Item> :
                  <Menu.Item
                    key="1"
                    onClick={() => handleEdit(show)}
                  >
                    แก้ไข
                  </Menu.Item>
                }
                <Menu.Item key="2" onClick={() => handleDelete(id)}>
                  ลบ
                </Menu.Item>
                {show.type === 'wms' ? null :
                  <Menu.Item key="2" onClick={() => handleExport(id)}>
                    Export
                  </Menu.Item>
                }
              </Menu>
            }
            placement="bottomLeft"
            trigger={["click"]}
            arrow
          >
            <MoreOutlined />
          </Dropdown>
        );
      }
    },
  ];

  const [select, setSelect] = useState()

  const getgroup = () => {
    Api.post("masterdata/getMasLayers", { group_name: "" })
      .then(async (data) => {
        setSelect(data.data.items)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const [id, setId] = useState(null)

  const onFinishCreate = async (value) => {
    // console.log(`value`, value)
    setLoading(true);
    Api.post("masterdata/masLayersShape", { ...value, id })
      .then(async (data) => {
        setIsModalVisible2({ create: false, edit: false });
        reload();
        setLoading(false);
        setIsModalVisible2(false)
        formCreate.resetFields();
        await Swal.fire("", "บันทึกข้อมูลเรียบร้อย", "success");
        window.location.reload();
        setId(null)
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setId(null)
      });

  };

  const [search, setSearch] = useState("")
  const reload = (_search = search) => {
    Api.get(`masterdata/masLayersShape?search=${_search}`)
      .then(({ data: { items } }) => {
        let tempDataArray = [];
        items.forEach((data, i) => {
          tempDataArray = [
            ...tempDataArray,
            {
              number: i + 1,
              ...data,
            },
          ];
        });
        // console.log(`tempDataArray`, tempDataArray)
        setData(tempDataArray);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
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

  useEffect(() => {
    reload();
    getgroup();
  }, [page]);



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
          const resp = await Api.delete(`masterdata/masLayersShape?id=` + id);
          // console.log(resp);
          reload();
          Swal.fire("", "ลบข้อมูลเรียบร้อยแล้ว", "success");
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "error");
    }
  };

  const handleEdit = async (show) => {
    // console.log(`show`, show)
    const { data } = await Api.get(`masterdata/masLayersShape/${show.id}`);
    setEditId(show.id)
    const items = data.items
    // console.log('items :>> ', items);
    setIsModalVisible(true)
    setConfigColor(items.config_color ?? false)

    if (items.color_layer) {
      const rgb = JSON.parse(items.color_layer)
      items.color_layer = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
      items.rgb = rgb;
    } else {
      items.color_layer = colorUpload.rgb
      items.rgb = colorUpload
    }

    setColorUpload({ ...colorUpload, hex: items.color_layer, rgb: items.rgb })
    let arr = []
    if (items.option_layer) {
      setInputValueOpacityColor(items.option_layer.fillOpacity ?? 0.5)
      setInputValueStrokColor(items.option_layer.strokeWeight ?? 1)
      setColorFrame({
        hex: items.option_layer.strokeColor.hex,
        rgb: items.option_layer.strokeColor.rgb,
      });
      if (items.option_layer.symbol) {
        items.option_layer.symbol.url = items.option_layer.symbol.location
        items.option_layer.symbol.name = items.option_layer.symbol.nameOld
        arr = [...arr, items.option_layer.symbol]
      }
      setFileListSymbol(arr);
    } else {
      items.option_layer = {}
    }


    form.setFieldsValue(data.items);
  }
  const handleEditWMS = async (show) => {
    const { data: { items } } = await Api.get(`masterdata/masLayersShape/${show.id}`);
    setEditId(show.id)
    setIsModalVisible3(true);
    form2.setFieldsValue({ ...items, date: moment(items.date) });
  }
  const handleExport = (id) => {
    setModalexport({ id: id, visible: true });
  }
  const onFinishExport = (val) => {
    // console.log('val :>> ', val.Export, modalexport.id);
    axios.get(`${process.env.NEXT_PUBLIC_SERVICE}/shp/convertGeoToShp?id=${modalexport.id}&type=${val.Export}`)
      .then(async data => {
        // console.log(data.config.url)
        const link = document.createElement('a');
        if (val.Export === 'shape file') {
          link.href = data.data.items;
          link.setAttribute('download', 'shapefile.zip');
          document.body.appendChild(link);
          link.click();
        } else {
          link.href = data.config.url;
          link.setAttribute('download', `${val.Export}.${val.Export.toLowerCase()}`);
          document.body.appendChild(link);
          link.click();
        }
      })
  }
  const onFinishEdit = async (data) => {
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
          edit(data);
        }
      });
    } catch (error) {
      console.log(error);
      Swal.fire("", "มีบางอย่างผิดพลาด", "success");
    }
  };

  const edit = async (value) => {
    try {
      // console.log('value :>> ', value);
      let Symbol = null;
      if (FileUploadSymbol) {
        const formDataSymbol = new FormData();
        formDataSymbol.append("file0", FileUploadSymbol.originFileObj);
        const token = cookies.get("token");
        const { data } = await axios({
          method: "post",
          url: `${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=symbol_point&Length=1`,
          config: { headers: { "Content-Type": "multipart/form-data" } },
          headers: { Authorization: "Bearer " + token },
          data: formDataSymbol,
        });
        Symbol = data.items[0]
      }


      const option_layer = {
        fillOpacity: inputValueOpacityColor,
        strokeWeight: inputValueStrokColor,
        strokeColor: colorFrame,
        symbol: Symbol ?? FileListSymbol[0],
      }
      const editGis = {
        ...value,
        color_layer: JSON.stringify(colorUpload.rgb),
        option_layer,
        config_color: configColor,
        id: editId,
      }
      let resp = await Api.post("masterdata/masLayersShape", editGis);
      // console.log('resp :>> ', resp);
      setInputValueOpacityColor(0.5)
      setInputValueStrokColor(1)
      setColorUpload({
        hex: "red",
        rgb: { r: 255, g: 0, b: 0, a: 1 },
      })
      setColorFrame({
        hex: "#000000",
        rgb: { r: 0, g: 0, b: 0, a: 1 },
      });

      await Swal.fire("", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
      reload();
      handleCancel();
      handleCancel3();
    } catch (error) {
      console.log('error :>> ', error);
    }
  }

  const showModal2 = () => {
    setIsModalVisible2(true);
  };
  const handleOk = () => {
    form.submit();
  };

  const handleOk2 = (form) => {
    if (form === "formCreate") {
      formCreate.submit();
    }
    if (form === "formEdit") {
      formEdit.submit();
    }
  };

  const handleOk3 = () => {
    form2.submit()
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
    form.resetFields();
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleCancel3 = () => {
    setIsModalVisible3(false);
    form2.resetFields();
  };

  /* Symbol */
  const handleChangeSymbol = (info) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    if (fileList.length > 0) {
      const infoFileList = fileList[0];
      if (infoFileList.status === "done") fileList = fileList.map((file) => file);
    }
    // console.log('fileList :>> ', fileList);
    setFileListSymbol(fileList);
    if (fileList.length > 0) setFileUploadSymbol(fileList[0]);
    else setFileUploadSymbol(null);
  };

  return (
    <>
      <Head>
        <title>จัดการผู้ใช้ระบบ</title>
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
            <h3 className="mb-4">จัดการข้อมูล GIS Layer</h3>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={5}>
            <Search placeholder="input search text"
              onSearch={(e) => { setLoading(true); reload(e); setSearch(e) }}
            />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} xxl={11}>
            <Button onClick={() => { setLoading(true); reload() }}>
              <RedoOutlined />
            </Button>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
            <Button
              type="primary"
              onClick={showModal2}
              style={{ float: "right" }}
            >
              + เพิ่ม WMS ของ GIS Layer
            </Button>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Select defaultValue="5" style={{ width: 100, float: "right", textAlign: "center" }} onChange={handleChangeSortTable}>
              <Option value="5">5 / page</Option>
              <Option value="10">10 / page</Option>
              <Option value="25">25 / page</Option>
              <Option value="50">50 / page</Option>
              <Option value="all">Page All</Option>
            </Select>
          </Col>
          <Col span={24}>
            <div className="table-responsive">
              {/* <Table
                scroll={{ x: true }}
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
              /> */}
              <DndProvider backend={HTML5Backend}>
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={data}
                  components={components}
                  pagination={{
                    current: page,
                    pageSize: pageSize,
                    onChange: (page, pageSize) => {
                      setPage(page);
                      setPageSize(pageSize);
                    },
                  }}
                  onRow={(record, index) => ({
                    index,
                    moveRow,
                  })}

                />
              </DndProvider>
            </div>
          </Col>
        </Row>
      </System>

      <Modal
        title="เพิ่ม WMS ของ GIS Layer"
        visible={isModalVisible2}
        onOk={() => handleOk2("formCreate")}
        onCancel={handleCancel2}
        style={{ top: 45 }}
      >
        <Form
          form={formCreate}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishCreate}
          labelAlign="left"
          colon={false}
          style={{ padding: "0%  0%  0% 10%" }}

        >
          <Form.Item
            name="name_layer"
            label="ชื่อ GIS Layer"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="group_layer_id"
            label="เลือก Group Layer"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="กลุ่มผู้ใช้งาน"
            // defaultValue=""
            >
              {select && select.map((data, index) => (
                <Option key={index} value={data.id}>
                  {data.group_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }, { type: "url" }]}>
            <Input placeholder="URL" />
          </Form.Item>
          {/* <Form.Item
            name="wms_name"
            label="Layer Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Layer Name" />
          </Form.Item> */}

          {menuItem}
          <Form.Item
            name="type_server"
            label="GIS Server Type"
            wrapperCol={{ span: 10 }}

            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => {
                changeTypeServer(e);
              }}
            >
              <Radio value="arcgisserver">ArcGIS Server</Radio>
              <Radio value="geoserver">GEO Server</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="แก้ไขข้อมูล GIS"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ top: 45 }}
      >
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
        >
          <Form.Item
            name="name_layer"
            label="ชื่อ"
            rules={[{ required: true }]}
            {...statusValidation}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="group_layer_id"
            label="Group Layer"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล กลุ่มผู้ใช้งาน" },
            ]}
          >
            <Select placeholder="กลุ่มผู้ใช้งาน">
              {select && select.map((data, index) => (
                <Option key={index} value={data.id}>
                  {data.group_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="color_layer" label="สีชั้นข้อมูล" >
            <Row>
              <Col span={6}>
                {/* setColorUpload({ ...colorUpload, rgb, hex })} */}
                <Color color={colorUpload} onChangeColor={({ rgb, hex }) => setColorUpload({ ...colorUpload, rgb, hex })} callbackSaveColor={(velue) => { }} />
              </Col>
              <Col span={18}>
                <Checkbox defaultChecked={configColor} checked={configColor} onChange={(value) => setConfigColor(value.target.checked)} className="text-red">ใช้สีนี้ในการแสดงผลบนแผนที่</Checkbox>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="Opacity" name="Opacity">
            <Row>
              <Col span={12}>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => {
                    setInputValueOpacityColor(value)
                  }}
                  value={typeof inputValueOpacityColor === 'number' ? inputValueOpacityColor : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={0}
                  max={1}
                  style={{ margin: '0 16px' }}
                  step={0.01}
                  value={inputValueOpacityColor}
                  onChange={(value) => {
                    setInputValueOpacityColor(value)
                  }}
                />
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="สีกรอบ">
            <Color color={colorFrame} onChangeColor={({ rgb, hex }) => setColorFrame({ ...colorUpload, rgb, hex })} callbackSaveColor={(velue) => {
              // console.log('velue Save :>> ', velue);
            }} />
          </Form.Item>

          <Form.Item label="ความหนากรอบ">
            <Row>
              <Col span={12}>
                <Slider
                  min={0}
                  max={10}
                  step={0.01}
                  onChange={(value) => {
                    setInputValueStrokColor(value)
                  }}
                  value={typeof inputValueStrokColor === 'number' ? inputValueStrokColor : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={0}
                  max={10}
                  style={{ margin: '0 16px' }}
                  step={0.01}
                  value={inputValueStrokColor}
                  onChange={(value) => {
                    setInputValueStrokColor(value)
                  }}
                />
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            label="Symbol"
            rules={[{ required: true, message: "กรุณาเลือกไฟล์!" }]}
            extra="ขนาดแนะนำ 25X35"
          >
            <Upload
              onChange={handleChangeSymbol}
              action={`${process.env.NEXT_PUBLIC_SERVICE}/demo/resTrue`}
              fileList={FileListSymbol}
              multiple={false}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

        </Form>
      </Modal>
      <Modal
        title="แก้ไขข้อมูล WMS"
        visible={isModalVisible3}
        onOk={handleOk3}
        onCancel={handleCancel3}
        style={{ top: 45 }}
      >
        <Form
          form={form2}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinishEdit}
        >
          <Form.Item
            name="name_layer"
            label="ชื่อ GIS Layer"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="group_layer_id"
            label="Group Layer"
            rules={[
              { required: true, message: "กรุณากรอกข้อมูล กลุ่มผู้ใช้งาน" },
            ]}
          >
            <Select placeholder="กลุ่มผู้ใช้งาน">
              {select && select.map((data, index) => (
                <Option key={index} value={data.id}>
                  {data.group_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="url"
            label="url"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {menuItem}
          <Form.Item
            name="type_server"
            label="GIS Server Type"
            wrapperCol={{ span: 10 }}

            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => {
                changeTypeServer(e);
              }}
            >
              <Radio value="arcgisserver">ArcGIS Server</Radio>
              <Radio value="geoserver">GEO Server</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal onCancel={() => setModalexport({ ...modalexport, visible: false })} title={<b>Export To</b>} visible={modalexport.visible} footer={false} >
        <Form
          name="customized_form_controls"
          layout="inline"
          onFinish={onFinishExport}
        >
          <Form.Item
            name="Export"
            label={"Export To"}
          >
            <Select
              style={{
                width: "250px",
                margin: '0 8px',
              }}
            >
              <Option value="KMZ">KMZ</Option>
              <Option value="KML">KML</Option>
              <Option value="CSV">CSV</Option>
              <Option value="XLS">XLS</Option>
              <Option value="shape file">SHAPE FILE</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              SaveTo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default usersSystemPage;
