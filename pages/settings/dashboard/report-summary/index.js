import Head from 'next/head'
import System from '../../../../components/_App/System'
import { Input, Col, Row, Select, Button, Table, Form } from 'antd'
import { } from 'antd/'
import Api from "../../../../util/Api"
import { useEffect, useState } from 'react';
import ReactHTMLTable from 'react-html-table-to-excel'
import { DownCircleOutlined, RedoOutlined } from "@ant-design/icons";
const { Option } = Select;
const index = () => {
    const [dataTableHead, setDataTableHead] = useState([])
    const [dataTable, setDataTable] = useState([])
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
        loadDataTable()
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
    const handleReport = async ({ search = "", project_name = "", layer_group = "", prov = "", tam = "", amp = "" }) => {
        let url = `shp/getFromReportBackOffice?project_name${project_name}`
        if (layer_group) url += `&layer_group=${layer_group}`
        if (prov) url += `&prov=${prov}`
        if (search) url += `&search=${search}`
        if (tam) url += `&tam=${tam}`
        if (amp) url += `&amp=${amp}`
        let result = await Api.get(url)
        modifyApi(result.data.items)
        console.log(dataTable)
    }
    const loadDataTable = async () => {
        let result = await Api.get("shp/getFromReportBackOffice");
        modifyApi(result.data.items)
    }
    const modifyApi = (data) => {

        // modifyInfo
        let newData = []
        data.data.all.forEach(item_prov => {
            item_prov.relationship = 1
            newData.push(item_prov)
            if (item_prov.amp_list.length) {//ถ้ามีอำเภอให้เข้า IF
                item_prov.amp_list.forEach(item_amp => {
                    item_amp.prov_name = item_amp.amp_name
                    item_amp.parent = item_prov.prov_name
                    item_amp.relationship = 2
                    newData.push(item_amp)
                    if (item_amp.tam_list.length) { //ถ้ามีตำบลให้เข้าIF
                        item_amp.tam_list.forEach(item_tam => {
                            item_tam.parent = item_amp.amp_name
                            item_tam.prov_name = item_tam.tam_name
                            item_tam.relationship = 3
                            item_tam.super_parent = item_prov.prov_name
                            item_tam.supersub = true
                            newData.push(item_tam)
                        })
                    }
                })
            }
        })
        for (let index = 0; index < data.table.length; index++) {
            let count = index + 1
            let name = "status_" + count
            let polt = "polt" + count
            let distance = "distance" + count
            newData.forEach((data_newData, index_newData) => {
                data.data[name].forEach(data_data => {
                    if (data_newData.prov_name === data_data.prov_name) {
                        newData[index_newData] = {
                            ...newData[index_newData], [polt]: data_data.plot, [distance]: data_data.distance
                        }
                    } else if (data_newData.amp_name) {
                        data_data.amp_list.forEach(data_amp => {
                            if (data_newData.amp_name === data_amp.amp_name) {
                                newData[index_newData] = {
                                    ...newData[index_newData], [polt]: data_amp.plot, [distance]: data_amp.distance
                                }
                            }
                        })
                    } else if (data_newData.tam_name) {
                        data_data.amp_list.forEach(data_amp => {
                            data_amp.tam_list.forEach(data_tam => {
                                if (data_newData.tam_name === data_tam.tam_name) {
                                    newData[index_newData] = {
                                        ...newData[index_newData], [polt]: data_tam.plot, [distance]: data_tam.distance
                                    }
                                }
                            })
                        })
                    }

                })

            })
        }

        //ผลรวมของ แปลง และระยะทาง
        newData.forEach((data_newData, index) => {
            let sumPlot = 0
            let sumDistance = 0
            for (let indexx = 0; indexx < data.table.length; indexx++) {
                let count = indexx + 1
                let plot = "polt" + count
                let distance = "distance" + count
                sumDistance += data_newData[distance] ?? 0
                sumPlot += data_newData[plot] ?? 0
            }
            newData[index] = {
                ...newData[index], sumPlot, sumDistance
            }
        })

        setDataTableHead(data.table)
        setDataTable(newData)
    }
    const showHideTable = (prov_name) => {
        $(`.sub${prov_name}`).hide()
        $(`.${prov_name}`).toggle()
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
                                    <Button className="btn-success " style={{ borderRadius: "3px", color: "white", marginLeft: "5px", float: "right" }} onClick={() => $(".export_excel").click()}>Export To Excel</Button>
                                    <Button type="primary" style={{ marginLeft: "5px", float: "right" }} htmlType="submit">Report</Button>
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
                            <table className="table table-bordered table-hover " id="dashboard_table" >
                                <colgroup span="2"></colgroup>
                                <colgroup span="2"></colgroup>
                                <tr align="center" >
                                    <td rowspan="2"></td>
                                    <th colspan="2" scope="colgroup" style={{ backgroundColor: "#adaaa9" }} onClick={() => console.log(dataTable)}>ทั้งหมด</th>
                                    {
                                        dataTableHead.map(data => {
                                            return <th colspan="2" scope="colgroup" style={{ backgroundColor: data.color }}>{data.status}</th>
                                        })
                                    }
                                </tr>
                                <tr align="center">
                                    <th scope="col" style={{ backgroundColor: "#adaaa9" }}>แปลง</th>
                                    <th scope="col" style={{ backgroundColor: "#adaaa9" }}>ระยะทาง</th>
                                    {
                                        dataTableHead.map(data => {
                                            return (
                                                <>
                                                    <th scope="col" style={{ backgroundColor: data.color }}>แปลง</th>
                                                    <th scope="col" style={{ backgroundColor: data.color }}>ระยะทาง</th>
                                                </>
                                            )
                                        })
                                    }
                                </tr>
                                <tbody>
                                    {
                                        dataTable.map(data =>
                                            <tr style={{ display: !data.parent || "none" }} className={`
                                        ${data.relationship != 1 ? data.parent : null}
                                        ${data.super_parent ? "sub" + data.super_parent : null}
                                        `}>
                                                <th scope="row">
                                                    {
                                                        <span style={{ marginLeft: data.amp_name ? "30px" : data.tam_name ? "60px" : null }}>
                                                            {data.prov_name}
                                                            {data.supersub ? null : <DownCircleOutlined style={{ marginLeft: "10px" }} onClick={() => showHideTable(data.prov_name)} />}
                                                        </span>
                                                    }
                                                </th>
                                                <td style={{ backgroundColor: "#e6e6e6" }} align="center">
                                                    {data.sumPlot.toFixed(2)}
                                                </td>
                                                <td style={{ backgroundColor: "#e6e6e6" }} align="center">
                                                    {data.sumDistance.toFixed(2)}
                                                </td>
                                                {
                                                    dataTableHead.map((dataa, index) => {
                                                        let count = index + 1
                                                        let plottt = "polt" + count
                                                        let distanceee = "distance" + count
                                                        return <>
                                                            <td style={{ backgroundColor: dataa.color }} align="center">{data[plottt] ?? 0}</td>
                                                            <td style={{ backgroundColor: dataa.color }} align="center">{data[distanceee] ?? 0}</td>
                                                        </>
                                                    })
                                                }
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            </System>
        </>
    )
}

export default index
