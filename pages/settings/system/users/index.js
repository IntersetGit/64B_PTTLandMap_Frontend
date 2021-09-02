import { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import Api from "../../../../util/Api";
import { EyeOutlined, RedoOutlined } from "@ant-design/icons";
import { Table, Input, Row, Col, Button } from "antd";
const { Search } = Input;
const usersSystemPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const reload=(search=null)=>{
    Api.post("/provider/getSearchUser").then((data) => {
      let tempDataArray = [];
      data.data.forEach((data, key) => {
        tempDataArray = [
          ...tempDataArray,
          {
            number: key + 1,
            ...data,
          },
        ];
      });
      setData(tempDataArray);
    });
  }
  useEffect(() => {
    reload()
  }, []);
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      dataIndex: "number",
      sorter:(record1,record2)=>{
        return record1.number>record2.number
      }
    },
    {
      key: "2",
      title: "ชื่อเข้าใช้ระบบ",
      dataIndex: "user_name",
      sorter:(record1,record2)=>{
        return record1.user_name>record2.user_name
      }
    },
    {
      key: "3",
      title: "ชื่อ-นามสกุล",
      dataIndex: "firstlast",
      sorter:(record1,record2)=>{
        return record1.firstlast>record2.firstlast
      }
    },
    {
      key: "4",
      title: "อีเมล",
      dataIndex: "e_mail",
      sorter:(record1,record2)=>{
        return record1.e_mail>record2.e_mail
      }
    },
    {
      key: "5",
      title: "กลุ่มผู้ใช้งาน",
      dataIndex: "roles_name",
      sorter:(record1,record2)=>{
        return record1.roles_name>record2.roles_name
      }
    },
    {
      key: "6",
      title: "จัดการ",
      dataIndex: "id",
      render: (id) => {
        return <EyeOutlined />;
      },
      responsive: ["md"],
    },
  ];

  const search = (value)=>{
    Api.post("/provider/getSearchUser",{search:value})
    .then(data=>{
      let tempDataArray = [];
      data.data.forEach((data, key) => {
        tempDataArray = [
          ...tempDataArray,
          {
            number: key + 1,
            ...data,
          },
        ];
      });
      setData(tempDataArray);
    })
  }
  return (
    <>
      <Head>
        <title>จัดการผู้ใช้ระบบ</title>
      </Head>
      <System>
        <Row gutter={[10, 10]} style={{ background: "white", padding: "16px" }}>
          <Col span={24}>
            <h3>จัดการผู้ใช้งานระบบ</h3>
          </Col>
          <Col span={5}>
                <Search placeholder="input search text" onSearch={search}/>
          </Col>
          <Col span={5}>
            <Button onClick={()=>{reload()}}>
              <RedoOutlined />
            </Button>
          </Col>
          <Col span={24}>
            <Table
            size="middle"
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

export default usersSystemPage;
