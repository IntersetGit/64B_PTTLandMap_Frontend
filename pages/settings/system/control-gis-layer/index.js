import { useState } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { Row, Col, Table, Card, Button, Modal, Form, Input } from "antd";
import { DeleteOutlined,ToolOutlined } from '@ant-design/icons';


const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 18 },
};

const index = () => {

  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
  };

  const columns = [
    {
      title: 'ชื่อ GIS Layer',
      dataIndex: 'name',
    },
    {
      title: 'กลุ่มของ Group Layer',
      dataIndex: 'chinese',
      sorter: {
        compare: (a, b) => a.chinese - b.chinese,
        multiple: 3,
      },
    },
    {
      title: 'สีของ Gis Layer',
      dataIndex: 'math',
      sorter: {
        compare: (a, b) => a.math - b.math,
        multiple: 2,
      },
    },
    {
      title: 'จัดการ',
      dataIndex: 'english',
      align:'center',
      sorter: {
        compare: (a, b) => a.english - b.english,
        multiple: 1,
      },
      render: (id) => {
        return <div><DeleteOutlined/> <ToolOutlined/></div>;
      },
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      chinese: 98,
      math: 60,
      english: 70,
    },
    {
      key: '2',
      name: 'Jim Green',
      chinese: 98,
      math: 66,
      english: 89,
    },
    {
      key: '3',
      name: 'Joe Black',
      chinese: 98,
      math: 90,
      english: 70,
    },
    {
      key: '4',
      name: 'Jim Red',
      chinese: 88,
      math: 99,
      english: 89,
    },
  ];

  function onChange(pagination, filters, sorter, extra) {
    console.log('params', pagination, filters, sorter, extra);
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

          <Col span={24}>

            <Card style={{ borderRadius: 20 }}>
              <Col className="butto">
                <Button type="primary" onClick={showModal} >เพิ่ม Layer</Button>
                <Modal
                  title="Title"
                  visible={visible}
                  onOk={handleOk}
                  confirmLoading={confirmLoading}
                  onCancel={handleCancel}
                >
                  <Form
                    {...layout}
                  >
                    <Form.Item label="ชื่อ GIS Layer">
                      <Input />
                    </Form.Item>
                    <Form.Item label="กลุ่มของ Group Layer">
                      <Input />
                    </Form.Item>
                    <Form.Item label="สีของ Gis Layer">
                      <Input type="color" style={{width:'20%'}} />
                    </Form.Item>
                  </Form>

                </Modal>

              </Col>

              <Col>
                <Table columns={columns} dataSource={data} onChange={onChange} />
              </Col>
            </Card>
          </Col>

        </Row>
      </System>
    </>
  );
};

export default index;
