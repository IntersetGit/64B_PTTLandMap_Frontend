import Layout from '../components/_App/Layout'
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Drawer, Tabs, Col, Collapse, Checkbox, Row, Card, Form, Input, Select, Upload, Button } from 'antd';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { SketchPicker } from 'react-color';
import { UnorderedListOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../util/Api'

const { TabPane } = Tabs;
const { Panel } = Collapse;

const mapPage = () => {

    const googlemap = useRef(null);
    const { user } = useSelector(({ user }) => user);
    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            version: 'weekly',
        });
        let map;
        loader.load().then(() => {
            const google = window.google;
            map = new google.maps.Map(googlemap.current, {
                mapTypeControl: false,
                fullscreenControl: false,
                center: { lat: 13.78, lng: 100.55 },
                zoom: 8,
            });
            google.maps.event.addListener(map, "mousemove", (event) => {
                getLatLon(event)
            });
        });
    }, []);


    const getLatLon = (event) => {
        let _lat = event.latLng.lat();
        let _lng = event.latLng.lng();
        let _utm = (new LatLng(_lat, _lng)).toUTMRef().toString().replace(/([0-9.]+) ([0-9.]+)/, '$1, $2');
        $('#latLong').text(`${_lat} / ${_lng}`)
        $('#utm').text(` [${_utm}] `)
    }



    /*  Shape File */
    const [visibleShapeFile, setVisibleShapeFile] = useState(false)
    const [groupLayerList, setGroupLayerList] = useState([])
    const [FileList, setFileList] = useState([])
    const [FileUpload, setFileUpload] = useState(null)
    const [openColorUpload, setOpenColorUpload] = useState(false)
    const [colorUpload, setColorUpload] = useState({
        hex: "red",
        rgb: "red",
    })


    const [formUpload] = Form.useForm();

    const handleChange = (info) => {
        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0]
            if (infoFileList.status === 'done') {
                // Get this url from response in real world.
                // console.log(`infoFileList.type`, infoFileList.originFileObj)
                // const blob = new Blob([infoFileList.originFileObj], { type: infoFileList.type });
                // const blobUrl = URL.createObjectURL(blob);
                fileList = fileList.map(file => {
                    // console.log('file file:>> ', file);
                    if (file.response) {
                        // Component will show file.url as link
                        // file.url = blobUrl;
                    }
                    return file;
                });
            }
        }

        // console.log('fileList :>> ', fileList);
        setFileList(fileList);
        if (fileList.length > 0) setFileUpload(fileList[0]); else {
            setFileUpload(null)
        }

    }

    const onFinishUpload = (value) => {

    }

    const onFinishFailedUpload = (error) => {

    }

    const openShapeFile = async () => {
        try {
            const { data } = await API.get(`/shp/getDataLayer`)
            // console.log('data :>> ', data.items);
            setGroupLayerList(data.items)
            setVisibleShapeFile(true)
        } catch (error) {

        }
    }

    const handleChangeShapeFile = ({ rgb, hex }, index1, index2) => {
        const arr = [...groupLayerList]
        arr[index1].children[index2].color_layer = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
        arr[index1].children[index2].rgb = rgb;
        // console.log('rgb :>> ', rgb);
        setGroupLayerList(arr)
    };

    const openColor = (index1, index2) => {
        const arr = [...groupLayerList]
        arr[index1].children[index2].open = !arr[index1].children[index2].open;
        setGroupLayerList(arr)
    };


    /*  Dashboard */
    const [visibleDashboard, setVisibleDashboard] = useState(false)


    /*  Search */
    const [visibleSearch, setVisibleSearch] = useState(false)

    return (
        <Layout isMap={true}>
            <Head>
                <title>PTT Land Map</title>
            </Head>

            <div className="tools-group-layer">
                <button className="btn btn-light btn-sm" onClick={openShapeFile}><i className="fa fa-window-restore" /></button>
            </div>
            <div className="tools-dashboard">
                <button className="btn btn-light btn-sm" onClick={() => setVisibleDashboard(true)}><i className="fa fa-dashboard" /></button>
            </div>

            <div className="map-info-area">
                <div className="map-info-detail">
                    <span>Lat/Long <span id="latLong" /> UTM <span id="utm" /></span>

                </div>
            </div>

            <div className="tools-map-cog">
                <Col span={6}>
                    <button className="btn btn-light btn-sm"><i className="fa fa-cog" /></button>
                </Col>
            </div>

            <div className="tools-map-area">
                <Col span={6}>
                    <button className="btn btn-light btn-sm" onClick={() => setVisibleDashboard(true)}><img width="100%" src="/assets/images/search.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/home.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/Line.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/-line_icon.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/polegon.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/arrow_back_time.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/cross.png" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%" src="/assets/images/arrows.png" /></button>
                </Col>
            </div>

            <div id="map" ref={googlemap} />


            {/* Shape File */}
            <Drawer
                width={350}
                placement={'left'}
                visible={visibleShapeFile}
                onClose={() => setVisibleShapeFile(false)}
            >
                <Tabs>
                    <TabPane tab="ชั้นข้อมูล" key="1" >
                        <Collapse ghost>

                            {groupLayerList.map((e, i) => Object.assign(
                                <Panel header={e.group_name} key={i}>
                                    {e.children ? e.children.map((x, index) => Object.assign(
                                        <div className="pt-2" key={e.id}>
                                            <Row>
                                                <Col xs={18}>
                                                    <Checkbox>{x.name_layer}</Checkbox>
                                                </Col>
                                                <Col xs={3}>
                                                    <a><UnorderedListOutlined /></a>
                                                </Col>
                                                <Col xs={3} style={{ paddingTop: 3 }}>
                                                    <a onClick={() => openColor(i, index)}>
                                                        <div style={
                                                            {
                                                                width: '36px',
                                                                height: '20px',
                                                                borderRadius: '2px',
                                                                background: x.color_layer,
                                                                border: '1px solid black'
                                                            }
                                                        } />
                                                    </a>
                                                    {x.open ? (
                                                        <div div style={{
                                                            position: 'fixed',
                                                            zIndex: '2',
                                                            textAlign: "end"
                                                        }}>
                                                            <SketchPicker color={!x.rgb ? x.color_layer : x.rgb} onChange={(value) => handleChangeShapeFile(value, i, index)} />
                                                            <footer className="footer-color">
                                                                <button className="btn btn-primary btn-sm">save</button>
                                                            </footer>

                                                        </div>
                                                    ) : null}

                                                </Col>
                                            </Row>
                                        </div>
                                    )) : null}
                                </Panel>
                            ))}


                        </Collapse>
                    </TabPane>

                    {(user && user.roles_id !== "0678bba5-a371-417f-9734-aec46b9579ad") ? (
                        <TabPane tab="Upload ชั้นข้อมูล" key="2">
                            <Card>
                                <Form
                                    form={formUpload}
                                    labelCol={{ span: 7 }}
                                    wrapperCol={{ span: 18 }}
                                    onFinish={onFinishUpload}
                                    onFinishFailed={onFinishFailedUpload}
                                    autoComplete="off"
                                    size={"small"}
                                >
                                    <Form.Item
                                        label="ชั้นข้อมูล"
                                        name="name"
                                        rules={[{ required: true, message: 'Please input your name!' }]}
                                    >
                                        <Select>
                                            <Option value="1">Lucy1</Option>
                                            <Option value="2">Lucy2</Option>
                                            <Option value="3">Lucy3</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label="ชื่อ"
                                        name="name"
                                        rules={[{ required: true, message: 'Please input your name!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="เอกสาร/รูป" >
                                        <Upload
                                            onChange={handleChange}
                                            fileList={FileList}
                                            multiple={false}
                                        >
                                            <Button icon={<UploadOutlined />}>Upload</Button>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item label="ประเภทไฟล์" >
                                       Type
                                    </Form.Item>

                                    <Form.Item label="สีชั้นข้อมูล">
                                        <a onClick={() => setOpenColorUpload(!openColorUpload)}>
                                            <div style={
                                                {
                                                    width: '36px',
                                                    height: '20px',
                                                    borderRadius: '2px',
                                                    background: colorUpload.hex,
                                                    border: '1px solid black'
                                                }
                                            } />
                                        </a>
                                        {openColorUpload ? (
                                            <div div style={{
                                                position: 'fixed',
                                                zIndex: '2',
                                                textAlign: "end"
                                            }}>
                                                <SketchPicker color={colorUpload.rgb} onChange={({ rgb, hex }) => setColorUpload({ ...colorUpload, rgb, hex })} />
                                                <footer className="footer-color">
                                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpenColorUpload(!openColorUpload)}>save</button>
                                                </footer>
                                            </div>
                                        ) : null}
                                    </Form.Item>

                                </Form>
                            </Card>
                        </TabPane>
                    ) : null}

                </Tabs>
            </Drawer>


            {/* Dashboard */}
            <Drawer
                title="Create a new account"
                width={350}
                placement={'left'}
                visible={visibleDashboard}
                onClose={() => setVisibleDashboard(false)}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>

            {/* Search */}
            <Drawer
                title="Create a new account"
                width={350}
                placement={'left'}
                visible={visibleSearch}
                onClose={() => setVisibleSearch(false)}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>




            <style global jsx>
                {`
                    .ant-collapse > .ant-collapse-item > .ant-collapse-header {
                        position: relative;
                        padding: 10px 0px;
                    }

                    .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
                        padding-top: 0px;
                        padding-bottom: 0px;
                    }
                `
                }
            </style>
        </Layout >
    )
}

export default mapPage
