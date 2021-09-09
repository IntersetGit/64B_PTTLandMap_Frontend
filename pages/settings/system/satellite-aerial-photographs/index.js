import Head from "next/head";
import System from "../../../../components/_App/System";
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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { Option } = Select;
const SatelliteAerialPhotographsPage = () => {
  const onFinish = (value) => {
    console.log(value["date-picker"].format("YYYY-MM-DD"));
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
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
            <Form
              onFinish={onFinish}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 6 }}
              className="mt-5"
            >
              <Form.Item
                name="typename"
                label="ประเภทของภาพ"
                hasFeedback
                rules={[{ required: true }]}
              >
                <Select placeholder="ประเภทของภาพ">
                  <Option value="china">ภาพถ่ายดาวเทียม</Option>
                  <Option value="usa">ภาพถ่ายจากโดรน</Option>
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
                name="layerName"
                label="Layer Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Layer Name" />
              </Form.Item>
              <Form.Item
                name="upload"
                label="Upload"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true }]}
                extra="ขนาดที่ recommend 80x80 pixcel"
              >
                <Upload name="logo" action="/upload.do" listType="picture">
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>
              <Form.Item
                name="radio-group"
                label=" "
                wrapperCol={{ span: 12 }}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="a">ArcGIS Server</Radio>
                  <Radio value="b">Image Server</Radio>
                  <Radio value="c">Geoserver</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </System>
    </>
  );
};

export default SatelliteAerialPhotographsPage;
