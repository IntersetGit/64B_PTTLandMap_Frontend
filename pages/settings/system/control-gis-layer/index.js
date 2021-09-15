import { useState } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { Row, Col, Form, Input, InputNumber, Button, Upload, Radio, DatePicker, Space, Card } from "antd";
import { UploadOutlined } from '@ant-design/icons';

const layout = {
  labelCol: {
    span: 6,
  },
  labelAlign: 'left',
  wrapperCol: {
    span: 14,
  },
};


const index = () => {

  const props = {
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    listType: 'picture',
    beforeUpload(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const img = document.createElement('img');
          img.src = reader.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = 'red';
            ctx.textBaseline = 'middle';
            ctx.font = '33px Arial';
            ctx.fillText('Ant Design', 20, 20);
            canvas.toBlob(resolve);
          };
        };
      });
    },
  };

  const onFinish = (values) => {
    console.log(values);
  };

  const [value, setValue] = useState(1);

  const onChange = e => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  function onChange2(date, dateString) {
    console.log(date, dateString);
  }



  return (
    <>
      <Head>
        <title>จัดการ ข้อมูล GIS Layer</title>
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
            <h3 className="mb-4">จัดการ ภาพถ่ายดาวเทียมและภาพถ่ายทางอากาศ</h3>
          </Col>

          <Col span={13}>
            <Card style={{borderRadius:20}}>
              <Form {...layout} name="nest-messages" onFinish={onFinish} colon={false} style={{marginLeft:'10%'}} >
                <Form.Item
                  name="type_image"
                  label="ประเภทของภาพ"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="data_wms"
                  label="ชื่อข้อมูล (WMS)"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="URL"
                  label="URL"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="Layer_name"
                  label="Layer Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="Picture"
                  label="Picture"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Upload {...props}>
                    <Button icon={<UploadOutlined />}>Select File</Button>
                  </Upload>
                  <p style={{ marginTop: '4%', color: 'blue' }}> ขนาดที่ recommend 80x80 pixcel</p>
                </Form.Item>
                <Form.Item label="       "
                  name="slect"
                >
                  <Radio.Group onChange={onChange} value={value}>
                    <Radio value={1}>ArcGIS Server</Radio>
                    <Radio value={2}>Image Server</Radio>
                    <Radio value={3}>Geoserver</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="Date"
                  name="Date"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Space direction="vertical">
                    <DatePicker onChange={onChange2} />
                  </Space>
                </Form.Item>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

        </Row>
      </System>
    </>
  );
};

export default index;
