import React, { useState, useEffect } from 'react';
import { Row, Col, Image, Input, Button, Form, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';


function App() {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    axios.post("http://localhost:9000/provider/login", {
      username: values.username,
      password: values.password
    })
      .then(res => {
        console.log(res.data)
      })
      .catch(error => {
        console.log(error)
      })

  };
  const [form] = Form.useForm();

  return (
    <>
      <div className="bodycard">
        <Row >
          <Col xs={2} sm={2} md={2} lg={2} xl={6} ></Col>
          <Col className="flex-items-1" xs={20} sm={20} md={20} lg={20} xl={12} style={{ marginTop: 200 }} >
            <Row >
              <Col xs={24} sm={24} md={13} lg={12} xl={12} style={{ padding: '10%', marginTop: "4%" }} >
                <Form
                  form={form}
                  name="normal_login"
                  className="login-form" initialValues={{
                    remember: true,
                  }}
                  onFinish={onFinish}
                  style={{ width: '100%' }}
                >
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Username !',
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Password!',
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="Password"
                    />
                  </Form.Item>

                  <Form.Item>

                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }} onClick={() => form.submit()}>
                      Sing in
                    </Button>

                  </Form.Item>
                </Form></Col>
              <Col xs={0} sm={0} md={11} lg={12} xl={12} style={{ float: 'flex', objectFit: 'contain' }}>
                <Image

                  width="100%"
                  src="images/VE_0026-02.jpg"
                  preview={false}
                /></Col>
            </Row>
          </Col>
          <Col xs={2} sm={2} md={2} lg={2} xl={6} ></Col>
        </Row>
      </div>
    </>
  );
}

export default App;