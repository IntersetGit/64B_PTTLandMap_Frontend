import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const Maps = (props) => {

    console.log('props.center :>> ', props.center);
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
                center: { lat: props.center && props.center.lat ? props.center.lat : 13.78, lng: props.center && props.center.lng ? props.center.lng : 100.55 },
                zoom: props.zoom ?? 8,
            });

            google.maps.event.addListener(map, "mousemove", (event) => {
                getLatLon(event)
            });
        });
    });

    /* get Lat Lon */
    const getLatLon = (event) => {
        let _lat = event.latLng.lat();
        let _lng = event.latLng.lng();
        let _utm = (new LatLng(_lat, _lng)).toUTMRef().toString().replace(/([0-9.]+) ([0-9.]+)/, '$1, $2');
        $('#latLong').text(`${_lat} / ${_lng}`)
        $('#utm').text(` [${_utm}] `)
    }

    return (
        <>

            <div className="map-info-area">
                <div class="map-info-detail">
                    <span>Lat/Long <span id="latLong" /> UTM <span id="utm" /></span>
                </div>
            </div>

            <div id="map" ref={googlemap} />

        </>
    )
}

export default Maps
