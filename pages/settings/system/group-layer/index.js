import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import { EyeOutlined, RedoOutlined } from "@ant-design/icons";
import { Table, Input, Row, Col, Button } from "antd";
import Api from "../../../../util/Api";
const { Search } = Input;

const GroupLayerSystemPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [data, setData] = useState([]);
  const reload =()=>{
    Api.get("/masterdata/masLayers").then((data) => {
      setData(data.data.items);
    });
  }
  useEffect(() => {
   reload()
  }, []);
  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "order_by",
    },
    {
      title: "group Layer",
      dataIndex: "group_name",
    },
    {
      title: "ความหมาย",
      dataIndex: "address",
    },
  ];

  const search = (value) => {
    Api.get("/masterdata/masLayersname",{params:{search:value}})
    .then(data=>{
      setData(data.data.items)
    })
  };
  return (
    <>
      <Head>
        <title>จัดการ Group Layer</title>
      </Head>
      <System>
        <Row gutter={[10, 10]} style={{ background: "white", padding: "16px" }}>
          <Col span={24}>
            <h3>จัดการผู้ใช้งานระบบ</h3>
          </Col>
          <Col span={5}>
            <Search placeholder="input search text" onSearch={search} />
          </Col>
          <Col span={5}>
            <Button onClick={()=>{reload()}}>
              <RedoOutlined />
            </Button>
          </Col>
          <Col span={3} offset={11} >
            <Button type="primary" >+ เพิ่ม group</Button>
          </Col>
          <Col span={24}>
            <Table
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
            />
          </Col>
        </Row>
      </System>
    </>
  );
};

export default GroupLayerSystemPage;
