/* eslint-disable no-undef */
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

    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
 
    return (
    <>
      <div className="bodycard">
        <Row >
          <Col xs={2} sm={2} md={2} lg={2} xl={6} ></Col>
          <Col className="flex-items-1" xs={20} sm={20} md={20} lg={20} xl={12} style={{ marginTop: 200 }} >
            <Row >
              <Col xs={24} sm={24} md={13} lg={12} xl={12} style={{ padding: '10%', marginTop: "4%" }} >
                
                <Form
      name="basic"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="Email"
        name="Email"
        rules={[
          {
            required: true,
            message: 'Please input your username!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit"  onClick={() => form.submit()}>
          Submit
        </Button>
      </Form.Item>
    </Form>
                
                </Col>
              
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