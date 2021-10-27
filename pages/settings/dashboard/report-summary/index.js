import Head from 'next/head'
import System from '../../../../components/_App/System'
import { Input, Col, Row, Select, Button, Table, Form } from 'antd'
import Api from "../../../../util/Api"
import { useEffect, useState } from 'react';
const { Option } = Select;
const { Column, ColumnGroup } = Table
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
                if (find) setLayerList(find.children)
            })
        } catch (error) {

        }
    }
    const data = [{
        land_all: "676",
        distance_all: "630",
        land_new_appove: "49",
        distance_new_appove: "130",
        land_distance: "110",
        distance_distance_all: "200",
        land_success: "511",
        distance_success: "300",
    }]
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
                            onFinish={() => alert()}
                        >
                            <Input.Group size="default">
                                <Row gutter={8}>
                                    <Col span={3}>
                                        <Form.Item>
                                            <Select
                                                placeholder="ชื่อโครงการ"
                                                allowClear
                                            >
                                                <Option value="project_na">ชื่อโครงการ</Option>
                                                <Option value="objectid">เลขที่โฉนด</Option>
                                                <Option value="parlabel1">ลำดับแปลงที่ดิน</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Form.Item
                                            label=""
                                            name="layer_group"
                                        >
                                            <Select
                                                placeholder="ชั้นข้อมูล"
                                                allowClear
                                            >
                                                {layerList.map(e => <Option key={`layer_group-${e.id}`} value={e.id}>{e.name_layer}</Option>)}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Form.Item name="prov">
                                            <Select placeholder="จังหวัด" style={{ width: "100%" }} onChange={(e) => onChangeProv(e, formDashboard)} allowClear>
                                                {
                                                    dataProvider.map(data => {
                                                        return <Option key={`prov-${data.id}`} value={data.name}>{data.name}</Option>
                                                    })
                                                }
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Form.Item name="amp">
                                            <Select placeholder="อำเภอ" style={{ width: "100%" }} allowClear onChange={(e) => onChangeAmp(e, formDashboard)} >
                                                {
                                                    dataAmp.map(data => <Option key={`amp-${data.id}`} value={data.name}>{data.name}</Option>)
                                                }
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Form.Item name="tam">
                                            <Select placeholder="ตำบล" style={{ width: "100%" }} allowClear onChange={(e) => onChangeTam(e, formDashboard)} >
                                                {
                                                    dataTam.map(data => <Option key={`tam-${data.id}`} value={data.name}>{data.name}</Option>)
                                                }
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={5} >
                                        <Button type="primary" style={{ marginRight: "5px" }} htmlType="submit">Report</Button>
                                        <Button className="btn-success" style={{ borderRadius: "2px", color: "white" }} onClick={() => loadShapeFile()}>Export To Excel</Button>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form>
                    </Col>
                    <Col span={24}>
                        <Table style={{ color: "red" }} dataSource={data}>
                            <ColumnGroup title="">
                                <ColumnGroup>
                                    <Column title="" dataIndex="firstName" key="firstName" />
                                </ColumnGroup>
                            </ColumnGroup>
                            <ColumnGroup title="ทั้งหมด">
                                <Column title="แปลง" dataIndex="land_all" />
                                <Column title="ระยะทาง (กม.)" dataIndex="distance_all" />
                            </ColumnGroup>
                            <ColumnGroup title="ได้รับอนุมัติให้ดำเนินการใหม่">
                                <Column title="แปลง" dataIndex="land_new_appove" />
                                <Column title="ระยะทาง (กม.)" dataIndex="distance_new_appove" />
                            </ColumnGroup>
                            <ColumnGroup title="อยู่ระหว่างดำเนินการ">
                                <Column title="แปลง" dataIndex="land_distance" key="land" />
                                <Column title="ระยะทาง (กม.)" dataIndex="distance_distance_all" key="all" />
                            </ColumnGroup>
                            <ColumnGroup title="ดำเนินการเรียบร้อยแล้ว">
                                <Column title="แปลง" dataIndex="land_success" key="all" />
                                <Column title="ระยะทาง (กม.)" dataIndex="distance_success" key="all" />
                            </ColumnGroup>
                        </Table>
                    </Col>
                </Row>
            </System>
        </>
    )
}

export default index
