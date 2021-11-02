import Head from 'next/head'
import System from '../../../../components/_App/System'
import { Input, Col, Row, Select, Button, Table, Form } from 'antd'
import Api from "../../../../util/Api"
import { useEffect, useState } from 'react';
const { Option } = Select;
import ReactHTMLTable from 'react-html-table-to-excel'
const index = () => {
    const [dataProvider, setDataProvider] = useState([]) //จังหวัด
    const [dataAmp, setDataAmp] = useState([]) //อำเภอ
    const [dataTam, setDataTam] = useState([]) //ตำบล
    const [layerList, setLayerList] = useState([]); //ชั้นข้อมูล
    const [provAmpTamAll, setProvAmpTamAll] = useState({
        prov: [],
        amp: [],
        tam: [],
    })
    const [formDashboard] = Form.useForm();
    useEffect(() => {
        loadShapeFile()
        loadGetShapeProvince()
    }, [])
    const loadGetShapeProvince = async (layer_group = "f942a946-3bcb-4062-9207-d78ab437edf3") => {
        Api.get("shp/getShapeProvince?layer_group=f942a946-3bcb-4062-9207-d78ab437edf3").then(data => {
            setProvAmpTamAll({
                ...provAmpTamAll, prov: data.data.items.prov, amp: data.data.items.amp, tam: data.data.items.tam
            })
            setDataProvider(data.data.items.prov)
            setDataAmp(data.data.items.amp)
            setDataTam(data.data.items.tam)
        })
    }
    const loadShapeFile = async () => {
        try {
            Api.get(`/shp/getDataLayer`).then(data => {
                const find = data.data.items.find(e => e.id === "f942a946-3bcb-4062-9207-d78ab437edf3")
                if (find) setLayerList(find.children ?? [])
            })
        } catch (error) {

        }
    }
    const onChangeProv = (value, _form) => {
        const find_prov = provAmpTamAll.prov.find(e => e.name == value)
        console.log(find_prov)
        if (find_prov) {
            const ampList = provAmpTamAll.amp.filter(e => e.prov_id == find_prov.id)
            setDataAmp(ampList)
            console.log(ampList)
        }
        /* subDistrict */
        setDataTam([])
        if (_form) _form.setFieldsValue({ ..._form, amp: null, tam: null })
    }
    const onChangeAmp = (value, _form) => {
        let find_amp = provAmpTamAll.amp.find(e => e.name == value), provList
        if (find_amp) {
            const tamList = provAmpTamAll.tam.filter(e => e.amp_id == find_amp.id)
            setDataTam(tamList)
        }
        if (find_amp) provList = provAmpTamAll.prov.find(e => e.id == find_amp.prov_id)
        if (_form) _form.setFieldsValue({ ..._form, prov: provList ? provList.name : _form.prov, tam: null })
    }
    const onChangeTam = (value, _form) => {
        let tamList = provAmpTamAll.tam.find(e => e.name == value), ampList, provList
        if (tamList) ampList = provAmpTamAll.amp.find(e => e.id == tamList.amp_id)
        if (ampList) {
            provList = provAmpTamAll.prov.find(e => e.id == ampList.prov_id)
            if (_form) _form.setFieldsValue({ ..._form, amp: ampList.name, prov: provList.name })
        }
    }
    const handleReport = (value) => {
        console.log(value)
    }
    return (
        <>
            <Head>
                <title>รายงานการสรุปผลการดำเนินงาน</title>
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
                        <Form
                            form={formDashboard}
                            initialValues={{
                                project_name: "project_na"
                            }}
                            onFinish={handleReport}
                        >
                            <div className="row" >
                                <div className="col-md-12 " style={{ marginBottom: "10px" }}>
                                    <div hidden={true}>
                                        <ReactHTMLTable className="export_excel" table="dashboard_table" filename="dashboard" buttonText="Export To Excel" />
                                    </div>
                                    <Button className="btn-success " style={{ borderRadius: "2px", color: "white", marginLeft: "2px", float: "right" }} onClick={() => $(".export_excel").click()}>Export To Excel</Button>
                                    <Button type="primary" style={{ marginLeft: "2px", float: "right" }} htmlType="submit">Report</Button>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="search">
                                        <Input placeholder="Search" />
                                    </Form.Item>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="project_name" >
                                        <Select placeholder="ชื่อโครงการ asfsa" allowClear>
                                            <Option value="project_na">ชื่อโครงการ</Option>
                                            <Option value="objectid">เลขที่โฉนด</Option>
                                            <Option value="parlabel1">ลำดับแปลงที่ดิน</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="layer_group">
                                        <Select
                                            placeholder="ชั้นข้อมูล"
                                            allowClear
                                        >
                                            {layerList.map(e => <Option key={`layer_group-${e.id}`} value={e.id}>{e.name_layer}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="prov">
                                        <Select placeholder="จังหวัด" style={{ width: "100%" }} onChange={(e) => onChangeProv(e, formDashboard)} allowClear>
                                            {
                                                dataProvider.map(data => {
                                                    return <Option key={`prov-${data.id}`} value={data.name}>{data.name}</Option>
                                                })
                                            }
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="amp">
                                        <Select placeholder="อำเภอ" style={{ width: "100%" }} allowClear onChange={(e) => onChangeAmp(e, formDashboard)} >
                                            {
                                                dataAmp.map(data => <Option key={`amp-${data.id}`} value={data.name}>{data.name}</Option>)
                                            }
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-md-2 ">
                                    <Form.Item name="tam">
                                        <Select placeholder="ตำบล" style={{ width: "100%" }} allowClear onChange={(e) => onChangeTam(e, formDashboard)} >
                                            {
                                                dataTam.map(data => <Option key={`tam-${data.id}`} value={data.name}>{data.name}</Option>)
                                            }
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>
                        </Form>
                    </Col>
                    <Col span={24}>
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dashboard_table">
                                <colgroup span="2"></colgroup>
                                <colgroup span="2"></colgroup>
                                <tr>
                                    <td rowspan="2"></td>
                                    <th colspan="2" scope="colgroup" style={{ backgroundColor: "#adaaa9" }}>ทั้งหมด</th>
                                    <th colspan="2" scope="colgroup" style={{ backgroundColor: "#a8d08d" }}>ได้รับอนุมัติให้ดำเนินการใหม่</th>
                                    <th colspan="2" scope="colgroup" style={{ backgroundColor: "#ff98cb" }}>อยู่ระหว่างดำเนินการ</th>
                                    <th colspan="2" scope="colgroup" style={{ backgroundColor: "#fe9a00" }}>ดำเนินการเรียบร้อยแล้ว</th>
                                </tr>
                                <tr>
                                    <th scope="col" style={{ backgroundColor: "#adaaa9" }}>แปลง</th>
                                    <th scope="col" style={{ backgroundColor: "#adaaa9" }}>ระยะทาง</th>
                                    <th scope="col" style={{ backgroundColor: "#a8d08d" }}>แปลง</th>
                                    <th scope="col" style={{ backgroundColor: "#a8d08d" }}>ระยะทาง</th>
                                    <th scope="col" style={{ backgroundColor: "#ff98cb" }}>แปลง</th>
                                    <th scope="col" style={{ backgroundColor: "#ff98cb" }}>ระยะทาง</th>
                                    <th scope="col" style={{ backgroundColor: "#fe9a00" }}>แปลง</th>
                                    <th scope="col" style={{ backgroundColor: "#fe9a00" }}>ระยะทาง</th>
                                </tr>
                                <tr>
                                    <th scope="row">Teddy Bears</th>
                                    <td style={{ backgroundColor: "#e6e6e6" }}>50,000</td>
                                    <td style={{ backgroundColor: "#e6e6e6" }}>30,000</td>
                                    <td style={{ backgroundColor: "#c3e0b4" }}>100,000</td>
                                    <td style={{ backgroundColor: "#c3e0b4" }}>80,000</td>
                                    <td style={{ backgroundColor: "#fce5d7" }}>100,000</td>
                                    <td style={{ backgroundColor: "#fce5d7" }}>80,000</td>
                                    <td style={{ backgroundColor: "#fec001" }}>100,000</td>
                                    <td style={{ backgroundColor: "#fec001" }}>80,000</td>
                                </tr>
                                <tr>
                                    <th scope="row">Board Games</th>
                                    <td style={{ backgroundColor: "#e6e6e6" }}>10,000</td>
                                    <td style={{ backgroundColor: "#e6e6e6" }}>5,000</td>
                                    <td style={{ backgroundColor: "#c3e0b4" }}>12,000</td>
                                    <td style={{ backgroundColor: "#c3e0b4" }}>9,000</td>
                                    <td style={{ backgroundColor: "#fce5d7" }}>12,000</td>
                                    <td style={{ backgroundColor: "#fce5d7" }}>9,000</td>
                                    <td style={{ backgroundColor: "#fec001" }}>12,000</td>
                                    <td style={{ backgroundColor: "#fec001" }}>9,000</td>
                                </tr>
                            </table>
                        </div>
                    </Col>
                </Row>
            </System>
        </>
    )
}

export default index
