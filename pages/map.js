import Layout from '../components/_App/Layout'
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const HomePage = () => {

    const googlemap = useRef(null);
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let labelIndex = 0;

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

            google.maps.event.addListener(map, "click", (event) => {
                addMarker(event.latLng, map);
            });
        });
    });

    function addMarker(location, map) {
        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        new google.maps.Marker({
            position: location,
            label: labels[labelIndex++ % labels.length],
            map: map,
        });
    }

    return (
        <Layout isMap={true}>
            <div id="map" ref={googlemap} />
        </Layout>
    )
}

export default HomePage
