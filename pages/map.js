import Layout from '../components/_App/Layout'
import { useState } from 'react';
import { Drawer, Col } from 'antd';
import Head from 'next/head';
import Maps from '../components/Maps'

const MapPage = () => {


    /*  */
    const [visible, setVisible] = useState(false)

    return (
        <Layout isMap={true}>
            <Head>
                <title>PTT Land Map</title>
            </Head>

            <div className="tools-group-layer">
                <button className="btn btn-light btn-sm" onClick={() => setVisible(true)}><i className="fa fa-window-restore" /></button>
            </div>

            <div className="tools-map-cog">
                <Col span={6}>
                    <button className="btn btn-light btn-sm"><i className="fa fa-cog" /></button>
                </Col>
            </div>

            <div className="tools-map-area">
                <Col span={6}>
                    <button className="btn btn-light btn-sm"><i className="fa fa-search" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-home" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-window-minimize" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-i-cursor" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-stop" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-refresh" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-times" /></button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm"><i className="fa fa-arrows-alt" /></button>
                </Col>
            </div>

            <Maps center={{ lat: 13.78, lng: 100.55 }} zoom={8} />

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

export default MapPage
