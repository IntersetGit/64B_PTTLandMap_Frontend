import { useEffect, useRef } from "react";
import { Row, Col, Image, Input, Button, Form, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Cookies } from "react-cookie";
import API from "../util/Api";

import { useDispatch } from "react-redux";
import { setToken } from "../redux/actions/userActions";
import { useRouter } from "next/router";
import Head from "next/head";
import { Encrypt, Decrypt } from "../util/SecretCode";

const LoginPage = () => {
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const route = useRouter();
  const dispatch = useDispatch();

  const isComponentMounted = useRef(true);

  useEffect(() => {
    if (isComponentMounted.current) {
      (() => {
        const token = cookies.get("token");
        /* จ้องเช็คว่า Token หมด อายุยัง */
        if (token) route.push("/");
      })();
    }

    if (cookies.get("remember")) {
      const remember = Decrypt(cookies.get("remember"));
      if (remember) {
        form.setFieldsValue({
          username: remember.username,
          password: null,
        });
      }
    }

    return () => {
      isComponentMounted.current = false;
    };
  });

  const onFinish = (values) => {
    // console.log('values ====================: ', values);
    const { username, password, remember } = values;

    const token = Encrypt({ username, password });
    API.post(`/provider/login`, { token })
      .then(
        ({
          data: {
            items: { access_token, refresh_token },
          },
        }) => {
          if (remember) {
            cookies.set("remember", Encrypt({ username }), { path: "/" });
          } else {
            if (cookies.get("remember"))
              cookies.remove("remember", { path: "/" });
          }
          dispatch(setToken(access_token, refresh_token));
          route.push("/");
        }
      )
      .catch((error) => {
        // console.log('error :>> ', error.response.status);
        message.error(
          error.response && error.response.status == 500
            ? error.response.data.error.message
            : "มีบางอย่างผิดพลาด !"
        );
        cookies.remove("token");
        cookies.remove("refresh_token");
      });
  };

  return (
    <div className="">
      <Head>
        <title>เข้าสู่ระบบ</title>
      </Head>
      <Row>
        <Col xs={0} sm={10} mg={10} lg={10} xl={15} >
          <img src="/assets/images/digital.png" preview={false} style={{ height: "100vh", width: '100%', objectFit: 'cover' }} />
        </Col>
        <Col xs={24} sm={14} mg={14} lg={14} xl={9} style={{ padding: '5%', marginTop: "-2%", }}>
          <Col style={{ padding: '0 0 15%' }}>
            <img width="50%" src="/assets/images/logo_PTT.png" preview={false} />
          </Col>
          <h2><b>Sing in</b></h2>
          <Form
            form={form}
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: false,
            }}
            onFinish={onFinish}
            style={{ width: "100%" }}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your Username !",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
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
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                style={{ width: "100%" }}
              >

                Log in
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
