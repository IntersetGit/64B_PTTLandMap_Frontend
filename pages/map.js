import Layout from '../components/_App/Layout'
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Drawer, Row, Col } from 'antd';
import Head from 'next/head';

const mapPage = () => {

    const googlemap = useRef(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: "AIzaSyArK9veHmyKP3QdYMPW1381JzFHqUwDg9U",
            version: 'weekly',
        });
        let map;
        loader.load().then(() => {
            const google = window.google;
            map = new google.maps.Map(googlemap.current, {
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



    /* map */
    const [visible, setVisible] = useState(false)

    return (
        <Layout isMap={true}>
            <Head>
                <title>PTT Land Map</title>
            </Head>

            <div className="tools-group-layer">
                <button className="btn btn-light btn-sm" onClick={() => setVisible(true)}><i className="fa fa-window-restore" /></button>
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
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/search.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/home.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/Line.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/-line_icon.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/polegon.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/arrow_back_time.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/cross.png"/></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><img width="100%"src="/assets/images/arrows.png"/></button>
                </Col>
            </div>

            <div id="map" ref={googlemap} />

            <Drawer
                title="Create a new account"
                width={350}
                placement={'left'}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>

        </Layout>
    )
}

export default mapPage
