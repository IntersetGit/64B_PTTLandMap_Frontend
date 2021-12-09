import { useEffect, useRef, useState } from "react";
import { Row, Col, Image, Input, Button, Form, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Cookies } from "react-cookie";
import API from "../util/Api";

import { useDispatch } from "react-redux";
import { setToken } from "../redux/actions/userActions";
import { useRouter } from "next/router";
import Head from "next/head";
import { Encrypt, Decrypt } from "../util/SecretCode";
import moment from "moment";

const LoginPage = () => {
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const route = useRouter();
  const dispatch = useDispatch();
  const [isBlock, setisBlock] = useState(false)
  const [dateText, setDateText] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pointLoading, setPointLoading] = useState(".")
  const [events, setEvents] = useState([
    "load",
    "mousemove",
    "mousedown",
    "click",
    "scroll",
    "keypress"])

  useEffect(() => {

    const token = cookies.get("token");

    /* จ้องเช็คว่า Token หมด อายุยัง */
    if (token) route.push("/");


    if (cookies.get("remember")) {
      const remember = Decrypt(cookies.get("remember"));
      if (remember) {
        form.setFieldsValue({
          username: remember.username,
          password: null,
        });
      }
    }

    for (var i in events) {/*ตรวจจับทุกอีเวน์ในการเคลื่อนไหว*/
      window.addEventListener(events[i], () => {
        const _isBlock = cookies.get("isBlock");
        if (_isBlock) {
          // console.log('_isBlock :>> ', _isBlock, new Date().getTime());
          // 1635962813197 1635963074976
          if (Number(_isBlock) <= new Date().getTime()) {
            setisBlock(false)
            setDateText(null)
            cookies.remove("isBlock", { path: "/" });
          } else {
            setDateText(moment(new Date(Number(_isBlock))).format("DD/MM/YYYY HH:mm:ss"))
            setisBlock(true)
          }
        } else {
          setisBlock(false)
          setDateText(null)
        }
      });
    }
  });



  const onFinish = (values) => {
    // console.log('values ====================: ', values);
    const { username, password, remember } = values;

    const token = Encrypt({ username, password });
    let point = pointLoading
    setLoading(true)
    var time = setInterval(function () {
      point += `.`
      setPointLoading(point)
    }, 1000);
    API.post(`/provider/login`, { token })
      .then(
        ({
          data: {
            items: { access_token, refresh_token },
          },
        }) => {
          setLoading(false)
          setPointLoading(`.`)
          clearInterval(time);
          if (remember) {
            cookies.set("remember", Encrypt({ username }), { path: "/" });
          } else {
            if (cookies.get("remember"))
              cookies.remove("remember", { path: "/" });
          }
          dispatch(setToken(access_token, refresh_token));
          cookies.remove("block", { path: "/" });
          route.push("/");
        }
      )
      .catch((error) => {
        // console.log('error :>> ', error.response.status);
        // console.log('error :>> ', error.response.data);
        setLoading(false)
        setPointLoading(`.`)
        clearInterval(time);
        message.error(
          error.response.data || error.response.status == 400 ? error.response.data.error.message : "มีบางอย่างผิดพลาด !"
        );

        if (error.response.status == 400) {
          if (error.response.data.error.message === "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง !") blockLogin()
        }

        cookies.remove("token");
        cookies.remove("refresh_token");
      });
  };

  const blockLogin = () => {

    const block = cookies.get("block");
    const countBlock = Number(block) + 1
    if (countBlock) cookies.set("block", countBlock, { path: "/" });
    else cookies.set("block", 1, { path: "/" });

    if (countBlock >= 5) {
      cookies.set("isBlock", (new Date().getTime() + (1 * 60 * 1000)), { path: "/" });
      cookies.remove("block", { path: "/" });
    }
  }

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
          <h2><b>Sign in</b></h2>
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
                disabled={isBlock || loading}
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
                disabled={isBlock || loading}
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox loading={loading} disabled={isBlock || loading}>Remember me</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                style={{ width: "100%" }}
                loading={loading} disabled={isBlock || loading}
              >
                Log in
              </Button>
            </Form.Item>

            {isBlock ? <h5 className="text-center text-red">ไม่สามารถใช้งานได้ถึง {dateText}</h5> : null}
            {loading ? <h5 className="text-center text-red">กำลังโหลดข้อมูล{pointLoading}</h5> : null}
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
