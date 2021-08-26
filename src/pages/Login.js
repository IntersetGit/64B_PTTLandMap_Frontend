import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Row, Col, Image, Input, Button, Form, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import API from '../util/Api';
import { Cookies } from 'react-cookie'
import { Decrypt } from '../util/SecretCode';
import jwt_decode from "jwt-decode";

/* redux */
import { useDispatch } from 'react-redux';
import { setToken, setAuthUser } from '../redux/actions/authActions';


const LoginPage = () => {

  const history = useHistory();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  const [form] = Form.useForm();

  useEffect(() => {
    const token = cookies.get('token');
    if (token) {
      history.push("/");
    }
  }, [])

  const onFinish = (values) => {
    // console.log('values ====================: ', values);
    const { username, password } = values
    API.post(`/provider/login`, { username, password }).then(({ data: { items: { access_token, refresh_token } } }) => {

      cookies.set('token', access_token, { path: '/' });
      if (refresh_token) cookies.set('refresh_token', refresh_token, { path: '/' });
      const { token } = jwt_decode(access_token)
      const dataUser = Decrypt(token);

      dispatch(setToken(token))
      dispatch(setAuthUser(dataUser))
      history.push("/");
    }).catch((error) => {
      // console.log('error :>> ', error.response.status);
      message.error(error.response && error.response.status == 500 ? error.response.data.error.message : "มีบางอย่างผิดพลาด !");
      cookies.remove("token");
      cookies.remove("refresh_token");
    })
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
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
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

export default LoginPage;