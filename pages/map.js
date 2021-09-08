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
            function CenterControl(controlDiv, map) {
                // Set CSS for the control border.
                const controlUI = document.createElement("div");
                controlUI.style.backgroundColor = "#fff";
                controlUI.style.border = "2px solid #fff";
                controlUI.style.borderRadius = "3px";
                controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
                controlUI.style.cursor = "pointer";
                controlUI.style.marginTop = "8px";
                controlUI.style.marginBottom = "22px";
                controlUI.style.textAlign = "center";
                controlUI.title = "Click to recenter the map";
                controlDiv.appendChild(controlUI);
                // Set CSS for the control interior.
                const controlText = document.createElement("div");
                controlText.style.color = "rgb(25,25,25)";
                controlText.style.fontFamily = "Roboto,Arial,sans-serif";
                controlText.style.fontSize = "16px";
                controlText.style.lineHeight = "38px";
                controlText.style.paddingLeft = "5px";
                controlText.style.paddingRight = "5px";
                controlText.innerHTML = "Center Map";
                controlUI.appendChild(controlText);

                const controlText2 = document.createElement("div");
                controlText2.style.color = "rgb(25,25,25)";
                controlText2.style.fontFamily = "Roboto,Arial,sans-serif";
                controlText2.style.fontSize = "16px";
                controlText2.style.lineHeight = "38px";
                controlText2.style.paddingLeft = "5px";
                controlText2.style.paddingRight = "5px";
                controlText2.innerHTML = "Center Map";
                controlUI.appendChild(controlText2);
                // Setup the click event listeners: simply set the map to Chicago.
                controlUI.addEventListener("click", () => {
                  map.setCenter({ lat: 41.85, lng: -87.65 });
                });
              }
              
            const centerControlDiv = document.createElement("div");
            CenterControl(centerControlDiv, map);

            const test =(controlDiv, map)=>{
                // Set CSS for the control border.
                const controlUI = document.createElement("div");
                controlUI.style.backgroundColor = "#fff";
                controlUI.style.border = "2px solid #fff";
                controlUI.style.borderRadius = "3px";
                controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
                controlUI.style.cursor = "pointer";
                controlUI.style.marginTop = "8px";
                controlUI.style.marginBottom = "22px";
                controlUI.style.textAlign = "center";
                controlUI.title = "Click to recenter the map";
                controlDiv.appendChild(controlUI);
                // Set CSS for the control interior.
                const controlText = document.createElement("div");
                controlText.style.color = "rgb(25,25,25)";
                controlText.style.fontFamily = "Roboto,Arial,sans-serif";
                controlText.style.fontSize = "16px";
                controlText.style.lineHeight = "38px";
                controlText.style.paddingLeft = "5px";
                controlText.style.paddingRight = "5px";
                controlText.innerHTML = "Center Map";
                controlUI.appendChild(controlText);
            }
            test(centerControlDiv, map)
            map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv);

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

            <div className="tools-map-area" style={{height:"40vh"}}>
                <Col span={6} >
                    <button  className="btn btn-light btn-sm"><img width="100%" height="100%" src="/assets/images/search.png"/></button>
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

            <div id="map" ref={googlemap} width="100%" />

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
