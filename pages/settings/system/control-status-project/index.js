import Head from "next/head";
import System from "../../../../components/_App/System";
import { Row, Col } from "antd";
const index = () => {
  return (
    <>
      <Head>
        <title>จัดการ Status โครงการ</title>
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
            <h3 className="mb-4">จัดการ Status โครงการ</h3>
          </Col>
        </Row>
      </System>
    </>
  );
};

export default index;
