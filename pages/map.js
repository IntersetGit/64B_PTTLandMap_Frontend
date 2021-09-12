import Layout from '../components/_App/Layout'
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Drawer, Tabs, Col, Collapse, Checkbox, Row } from 'antd';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { SketchPicker } from 'react-color';

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
    });


    const getLatLon = (event) => {
        let _lat = event.latLng.lat();
        let _lng = event.latLng.lng();
        let _utm = (new LatLng(_lat, _lng)).toUTMRef().toString().replace(/([0-9.]+) ([0-9.]+)/, '$1, $2');
        $('#latLong').text(`${_lat} / ${_lng}`)
        $('#utm').text(` [${_utm}] `)
    }



    /*  Shape File */
    const [visibleShapeFile, setVisibleShapeFile] = useState(false)


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
                <button className="btn btn-light btn-sm" onClick={() => setVisibleShapeFile(true)}><i className="fa fa-window-restore" /></button>
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
                            <Panel header="แปลงที่ดิน" key="1">
                                <div className="pt-2">
                                    <Row>
                                        <Col>
                                            <Checkbox>ลำดับแปลงที่ดิน</Checkbox>
                                        </Col>
                                        <Col>
                                            <SketchPicker />
                                        </Col>
                                    </Row>

                                </div>
                            </Panel>

                        </Collapse>
                    </TabPane>

                    {(user && user.roles_id !== "0678bba5-a371-417f-9734-aec46b9579ad") ? (
                        <TabPane tab="Upload ชั้นข้อมูล" key="2">
                            Content of Tab Pane 3
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
        </Layout>
    )
}

export default mapPage
