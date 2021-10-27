import Head from 'next/head'
import System from '../../../../components/_App/System'
import { Input, Col, Row, Select, Button, Table } from 'antd'
const { Option } = Select;
const { Column, ColumnGroup } = Table
const index = () => {
    return (
        <>
            <Head>
                <title>รายงานการสรุปผลการดำเนินงาน</title>
            </Head>
            <System>
                <h3>รายงานการสรุปผลการดำเนินงาน</h3>
                <Input.Group size="default">
                    <Row gutter={8}>
                        <Col span={3}>
                            <Select defaultValue="lucy" style={{ width: "100%" }} >
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Select defaultValue="lucy" style={{ width: "100%" }} >
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Select defaultValue="lucy" style={{ width: "100%" }} >
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Select defaultValue="lucy" style={{ width: "100%" }} >
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Select defaultValue="lucy" style={{ width: "100%" }} >
                                <Option value="lucy">Lucy</Option>
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Button type="primary">Report</Button>
                        </Col>
                        <Col span={3}>
                            <button className="btn btn-success" style={{ borderRadius: "2px" }}>Export To Excel</button>
                        </Col>
                    </Row>
                </Input.Group>
                <Table>

                </Table>
            </System>
        </>
    )
}

export default index
