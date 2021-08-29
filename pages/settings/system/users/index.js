import React, { useState, useEffect } from "react";
import Head from "next/head";
import System from "../../../../components/_App/System";
import axios from "axios";
import { EyeOutlined,RedoOutlined } from "@ant-design/icons";
import { Table, Input ,Row,Col,Button} from "antd";
const { Search } = Input;
const usersSystemPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  useEffect(() => {
    axios.get("http://localhost:9000/provider/getUser").then((data) => {
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
      console.log(tempDataArray);
    });
  }, []);
  const columns = [
    {
      key: "1",
      title: "ลำดับ",
      dataIndex: "number",
    },
    {
      key: "2",
      title: "ชื่อเข้าใช้ระบบ",
      dataIndex: "user_name",
    },
    {
      key: "3",
      title: "ชื่อ-นามสกุล",
      dataIndex: "firstlast",
    },
    {
      key: "4",
      title: "อีเมล",
      dataIndex: "e_mail",
    },
    {
      key: "5",
      title: "กลุ่มผู้ใช้งาน",
      dataIndex: "roles_name",
    },
    {
      key: "6",
      title: "จัดการ",
      dataIndex: "id",
      render: (id) => {
        return <EyeOutlined />;
      },
      responsive:['md']
    },
  ];

  return (
    <>
      <Head>
        <title>จัดการผู้ใช้ระบบ</title>
      </Head>
      <System>
        <div style={{ background: "white", padding: "20px" }}>
          <h3>จัดการผู้ใช้งานระบบ</h3>
          <br />
          <Search placeholder="input search text" style={{ width: 200 }} />
          <Button style={{marginLeft:"15px"}}><RedoOutlined /></Button>
          <br />
          <br />
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
        </div>
      </System>
    </>
  );
};

export default usersSystemPage;
