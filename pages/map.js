import Layout from "../components/_App/Layout";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import {
    Drawer,
    Tabs,
    Col,
    Collapse,
    Checkbox,
    Row,
    Card,
    Form,
    Input,
    Select,
    Upload,
    Button,
    message,
} from "antd";
import Head from "next/head";
import { useSelector } from "react-redux";
import { SketchPicker } from "react-color";
import { UnorderedListOutlined, UploadOutlined } from "@ant-design/icons";
import API from "../util/Api";
import RefreshToken from "../util/RefreshToken";
import axios from "axios";
import { Cookies } from "react-cookie";
import jwt_decode from "jwt-decode";

const cookies = new Cookies();

const { TabPane } = Tabs;
const { Panel } = Collapse;

const { Option } = Select;
const mapPage = () => {
    const [map, setMap] = useState(null);
    const googlemap = useRef(null);
    const { user } = useSelector(({ user }) => user);
    const centerMap = { lat: 13.78, lng: 100.55 }
    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            version: "weekly",
            libraries: ["drawing", "places"],
        });
        loader.load().then(() => {
            const google = window.google;
            var _map = new google.maps.Map(googlemap.current, {
                mapTypeControl: false,
                fullscreenControl: false,
                center: centerMap,
                zoom: 8,
            });
            setMap(_map);
            // $("#home").click(() => {
            //     _map.setCenter(centerMap);
            // });
            google.maps.event.addListener(map, "mousemove", (event) => {
                getLatLon(event);
            });
        });

        loadShapeFile()
    }, []);

    const clickHome = () => {
        map.setCenter(centerMap);
    }

    const getLatLon = (event) => {
        let _lat = event.latLng.lat();
        let _lng = event.latLng.lng();
        let _utm = new LatLng(_lat, _lng)
            .toUTMRef()
            .toString()
            .replace(/([0-9.]+) ([0-9.]+)/, "$1, $2");
        $("#latLong").text(`${_lat} / ${_lng}`);
        $("#utm").text(` [${_utm}] `);
    };

    /*  Shape File */
    const [visibleShapeFile, setVisibleShapeFile] = useState(false);
    const [groupLayerList, setGroupLayerList] = useState([]);
    const [FileList, setFileList] = useState([]);
    const [FileUpload, setFileUpload] = useState(null);
    const [FileType, setFileType] = useState(null);
    const [openColorUpload, setOpenColorUpload] = useState(false);
    const [colorUpload, setColorUpload] = useState({
        hex: "red",
        rgb: { r: 255, g: 0, b: 0, a: 1 },
    });

    const [formUpload] = Form.useForm();

    const handleChange = (info) => {
        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                // Get this url from response in real world.
                // console.log(`infoFileList.type`, infoFileList.originFileObj)
                // const blob = new Blob([infoFileList.originFileObj], { type: infoFileList.type });
                // const blobUrl = URL.createObjectURL(blob);
                fileList = fileList.map((file) => {
                    if (file.response) {
                        // Component will show file.url as link
                        // file.url = blobUrl;
                        const type = `${file.name
                            .substring(file.name.lastIndexOf(".") + 1)
                            .toLowerCase()
                            .toLowerCase()}`;
                        const nameType =
                            type == "zip" || type == "rar" ? "shape file" : type;
                        setFileType(nameType);
                    }
                    return file;
                });
            }
        }

        // console.log('fileList :>> ', fileList);
        setFileList(fileList);
        if (fileList.length > 0) setFileUpload(fileList[0]);
        else {
            setFileUpload(null);
            setFileType(null);
        }
    };

    const onFinishUpload = async (value) => {
        try {
            // console.log('value :>> ', value);
            // console.log('FileType :>> ', FileType);
            // console.log('colorUpload :>> ', colorUpload.hex);
            if (FileUpload) {
                const formData = new FormData();
                formData.append("file", FileUpload.originFileObj);
                const { name_layer, group_layer_id } = value;
                const token = cookies.get("token");

                if (token) {
                    const token_decode = jwt_decode(token);
                    if (token_decode.exp < Date.now() / 1000) {
                        console.log("หมดเวลาtoken");
                        const refresh_token = cookies.get('refresh_token');
                        await RefreshToken(refresh_token);
                    }

                    await axios({
                        method: "post",
                        url: `${process.env.NEXT_PUBLIC_SERVICE
                            }/shp/add?name_layer=${name_layer}&type=${FileType}&group_layer_id=${group_layer_id}&color=${JSON.stringify(
                                colorUpload.rgb
                            )}`,
                        config: { headers: { "Content-Type": "multipart/form-data" } },
                        headers: { Authorization: "Bearer " + token },
                        data: formData,
                    });
                    await loadShapeFile();
                    setFileList([]);
                    setFileUpload(null);
                    setFileType(null);
                    setOpenColorUpload(false);
                    setColorUpload({
                        hex: "red",
                        rgb: { r: 255, g: 0, b: 0, a: 1 },
                    });
                    formUpload.resetFields();

                    message.success("บันทึกสำเร็จ");
                }
            } else {
                message.error("กรุณาเลือกไฟล์!");
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาด !");
        }
    };

    // const RefreshToken = async (refreshtokenval) => {
    //     try {
    //         if (refreshtokenval) {
    //             const { data } = await axios({
    //                 method: "get",
    //                 url: `${process.env.NEXT_PUBLIC_SERVICE}/provider/refreshToken`,
    //                 headers: { Authorization: "Bearer " + refreshtokenval },
    //             });
    //             const token = data.items;
    //             cookies.set("token", token, { path: "/" });
    //             // window.location.reload();
    //         } else {
    //             logout();
    //         }
    //     } catch (error) {
    //         logout();
    //     }
    // };

    // const logout = () => {
    //     cookies.remove("token");
    //     cookies.remove("refresh_token");
    //     window.location.href = "/login";
    // };

    const onFinishFailedUpload = (error) => {
        message.error("มีบางอย่างผิดพลาด !");
    };

    const loadShapeFile = async () => {
        try {
            const refresh_token = cookies.get('refresh_token');
            await RefreshToken(refresh_token);
            const { data } = await API.get(`/shp/getDataLayer`)

            data.items.forEach(e => {
                if (e.children) {
                    e.children.forEach(x => {
                        if (x.color_layer) {
                            const rgb = JSON.parse(x.color_layer)
                            x.color_layer = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
                            x.rgb = rgb;
                        }
                    });
                }
            });
            // console.log('data :>> ', data.items);
            setGroupLayerList(data.items)
        } catch (error) {
            message.error("มีบางอย่างผิดพลาด !");
        }
    }

    const handleChangeShapeFile = ({ rgb, hex }, index1, index2) => {
        const arr = [...groupLayerList];
        arr[index1].children[
            index2
        ].color_layer = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
        arr[index1].children[index2].rgb = rgb;
        // console.log('rgb :>> ', rgb);
        setGroupLayerList(arr);

        map.data.setStyle({
            fillColor: arr[index1].children[index2].color_layer,
        });
    };

    const checkboxLayer = async (value, index1, index2) => {
        const arr = [...groupLayerList]
        // if (value.target.checked) {
        //     const item = arr[index1].children[index2];
        //     await getDeoJson(item.id, item.color_layer)
        //     arr.forEach((e, i) => {
        //         if (e.children) {
        //             e.children.forEach((x, ii) => {
        //                 x.checked = (i == index1 && ii == index2) ? true : false
        //             });
        //         }
        //     });

        // } else {
        //     arr[index1].children[index2].checked = value.target.checked
        //     clearMapData()
        // }

        arr[index1].children[index2].checked = value.target.checked
        if (!value.target.checked) {
            arr[index1].children[index2].checked = value.target.checked
            clearMapData()
        } else {
            const item = arr[index1].children[index2];
            await getDeoJson(item.id, item.color_layer)
        }
        setGroupLayerList(arr)
    };

    const clearMapData = () => {
        console.log("adasd" , map);
        map.data.forEach((feature) => {
            console.log('feature :>> ', feature);
            // map.data.remove(feature);
        });
    }

    const getDeoJson = async (id, color) => {
        try {
            // console.log("color :>> ", color);
            const { data } = await API.get(`/shp/shapeData?id=${id}`);
            const GeoJson = data.items.shape;
            // console.log('GeoJson :>> ', GeoJson);

            /* old */
            // map.data.addGeoJson(GeoJson);
            // const bounds = new google.maps.LatLngBounds();
            // map.data.forEach((feature) => {
            //     feature.getGeometry().forEachLatLng((latlng) => {
            //         bounds.extend(latlng);
            //     });
            // });
            // map.fitBounds(bounds);

            // map.data.setStyle({
            //     fillColor: color,
            // });

            /* new */
            const bounds = new google.maps.LatLngBounds();
            const layer = new google.maps.Data();
            layer.addGeoJson(GeoJson)
            layer.setStyle({
                fillColor: color,
                opacity: 0.5,
                strokeWeight: 1,
                clickable: false
            });
            layer.setMap(map);

            layer.forEach((feature) => {
                // console.log('feature :>> ', feature);
                feature.getGeometry().forEachLatLng((latlng) => {
                    bounds.extend(latlng);
                });
            });
            map.fitBounds(bounds);

        } catch (error) { }
    };

    const openColor = (index1, index2) => {
        const arr = [...groupLayerList];
        arr[index1].children[index2].open = !arr[index1].children[index2].open;
        setGroupLayerList(arr);
    };

    const saveColor = async (index1, index2) => {
        try {
            const arr = [...groupLayerList]
            const item = arr[index1].children[index2];
            const _model = {
                name_layer: item.name_layer,
                table_name: item.table_name,
                color_layer: JSON.stringify(item.rgb),
                type: item.type,
                group_layer_id: arr[index1].id,
                id: item.id
            }
            console.log('_model :>> ', _model);
            await API.post(`/masterdata/masLayersShape`, _model)

            openColor(index1, index2)
        } catch (error) {
            message.error("มีบางอย่างผิดพลาด !");
        }
    };

    /*  Dashboard */
    const [visibleDashboard, setVisibleDashboard] = useState(false);

    /*  Search */
    const [visibleSearch, setVisibleSearch] = useState(false);

    const [fullscreen, setFullScreen] = useState(false);
    const openFullscreen = () => {
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE11 */
            elem.msRequestFullscreen();
        }
        setFullScreen(true);
    };
    const closeFullscreen = () => {
        if (fullscreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE11 */
                document.msExitFullscreen();
            }
        }
    };
    const menuOpenFullscreen = () => {
        $("#openFullscreen").fadeToggle();
        $("#closeFullscreen").fadeToggle("slow");
    };

    return (
        <Layout isMap={true}>
            <Head>
                <title>PTT Land Map</title>
            </Head>

            <div className="tools-group-layer">
                <button className="btn btn-light btn-sm" onClick={() => setVisibleShapeFile(true)}>
                    {/* <i className="fa fa-window-restore" /> */}
                    <img width="100%" src="/assets/images/fa-window-restore.png" alt="" />
                </button>
            </div>
            <div className="tools-dashboard">
                <button
                    className="btn btn-light btn-sm"
                    onClick={() => setVisibleDashboard(true)}
                >
                    {/* <i className="fa fa-dashboard" /> */}
                    <img width="100%" src="/assets/images/fa-dashboard.png" alt="" />
                </button>
            </div>

            <div className="map-info-area">
                <div className="map-info-detail">
                    <span>
                        Lat/Long <span id="latLong" /> UTM <span id="utm" />
                    </span>
                </div>
            </div>

            <div className="tools-map-cog">
                <Col span={6}>
                    <i
                        className="fa fa-cog"
                        style={{ fontSize: "20px", marginTop: "2.5px" }}
                        id="config-map-cog"
                    />
                </Col>
            </div>

            <div className="tools-map-area">
                {/* Administrator And Editor */}
                {user &&
                    (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" ||
                        user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4") ? (
                    <Col span={6}>
                        <button
                            className="btn btn-light btn-sm"
                            onClick={() => setVisibleDashboard(true)}
                        >
                            <img width="100%" src="/assets/images/search.png" />
                        </button>
                    </Col>
                ) : null}

                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={clickHome}>
                        <img
                            width="120%"
                            style={{ marginTop: "-2px", marginLeft: "-1px" }}
                            src="/assets/images/home.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm">
                        <img
                            width="120%"
                            style={{ marginTop: "-2px" }}
                            src="/assets/images/Line.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm">
                        <img
                            width="120%"
                            style={{ marginTop: "-2px", marginLeft: "-1px" }}
                            src="/assets/images/-line_icon.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm">
                        <img
                            width="120%"
                            style={{ marginTop: "-2px", marginLeft: "-1px" }}
                            src="/assets/images/polegon.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm">
                        <img
                            width="120%"
                            style={{ marginTop: "-2px", marginLeft: "-1px" }}
                            src="/assets/images/arrow_back_time.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm">
                        <img
                            width="120%"
                            style={{ marginTop: "-2px", marginLeft: "-1.5px" }}
                            src="/assets/images/cross.png"
                        />
                    </button>
                </Col>
            </div>
            <div className="tools-map-area2">
                <Col span={24} className="pt-2">
                    <button
                        className="btn btn-light btn-sm "
                        id="closeFullscreen"
                        style={{ display: "none" }}
                        onClick={() => closeFullscreen()}
                    >
                        <img
                            width="110%"
                            style={{ marginTop: "-1px" }}
                            src="/assets/images/close_full_screen.png"
                        />
                    </button>
                    <button
                        className="btn btn-light btn-sm"
                        id="openFullscreen"
                        style={{ display: "none" }}
                        onClick={() => openFullscreen()}
                    >
                        <img width="120%" src="/assets/images/open_full_screen.png" />
                    </button>
                    <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                            menuOpenFullscreen();
                        }}
                    >
                        <img
                            width="120%"
                            style={{ marginTop: "-1px" }}
                            src="/assets/images/menu_full_screen.png"
                        />
                    </button>
                </Col>
            </div>

            <div id="map" ref={googlemap} />

            {/* Shape File */}
            <Drawer
                width={350}
                placement={"left"}
                visible={visibleShapeFile}
                onClose={() => setVisibleShapeFile(false)}
            >
                <Tabs>
                    <TabPane tab="ชั้นข้อมูล" key="1">
                        <Collapse ghost>
                            {groupLayerList.map((e, i) =>
                                Object.assign(
                                    <Panel header={e.group_name} key={i}>
                                        {e.children
                                            ? e.children.map((x, index) =>
                                                Object.assign(
                                                    <div className="pt-2" key={e.id}>
                                                        <Row>
                                                            <Col xs={18}>
                                                                <Checkbox
                                                                    checked={x.checked}
                                                                    onClick={(value) =>
                                                                        checkboxLayer(value, i, index)
                                                                    }
                                                                >
                                                                    {x.name_layer}
                                                                </Checkbox>
                                                            </Col>
                                                            <Col xs={3}>
                                                                <a>
                                                                    <UnorderedListOutlined />
                                                                </a>
                                                            </Col>
                                                            <Col xs={3} style={{ paddingTop: 3 }}>
                                                                <a onClick={() => openColor(i, index)}>
                                                                    <div
                                                                        style={{
                                                                            width: "36px",
                                                                            height: "20px",
                                                                            borderRadius: "2px",
                                                                            background: x.color_layer,
                                                                            border: "1px solid black",
                                                                        }}
                                                                    />
                                                                </a>
                                                                {x.open ? (
                                                                    <div
                                                                        div
                                                                        style={{
                                                                            position: "fixed",
                                                                            zIndex: "2",
                                                                            textAlign: "end",
                                                                        }}
                                                                    >
                                                                        <SketchPicker
                                                                            color={!x.rgb ? x.color_layer : x.rgb}
                                                                            onChange={(value) =>
                                                                                handleChangeShapeFile(value, i, index)
                                                                            }
                                                                        />
                                                                        <footer className="footer-color">
                                                                            <button
                                                                                className="btn btn-primary btn-sm"
                                                                                onClick={() => saveColor(i, index)}
                                                                            >
                                                                                save
                                                                            </button>
                                                                        </footer>
                                                                    </div>
                                                                ) : null}
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            )
                                            : null}
                                    </Panel>
                                )
                            )}
                        </Collapse>
                    </TabPane>

                    {/* Administrator And Editor */}
                    {user &&
                        (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" ||
                            user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4") ? (
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
                                        name="group_layer_id"
                                        rules={[
                                            { required: true, message: "กรุณาเลือกชั้นข้อมูล!" },
                                        ]}
                                    >
                                        <Select>
                                            {groupLayerList.map((e, i) => (
                                                <Option key={e.id} value={e.id}>
                                                    {e.group_name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label="ชื่อ"
                                        name="name_layer"
                                        rules={[{ required: true, message: "กรุณากรอกข้อมูล!" }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="เลือกไฟล์"
                                        rules={[{ required: true, message: "กรุณาเลือกไฟล์!" }]}
                                    >
                                        <Upload
                                            onChange={handleChange}
                                            fileList={FileList}
                                            multiple={false}
                                        >
                                            <Button icon={<UploadOutlined />}>Upload</Button>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item label="ประเภทไฟล์">{FileType}</Form.Item>

                                    <Form.Item label="สีชั้นข้อมูล">
                                        <a onClick={() => setOpenColorUpload(!openColorUpload)}>
                                            <div
                                                style={{
                                                    width: "36px",
                                                    height: "20px",
                                                    borderRadius: "2px",
                                                    background: colorUpload.hex,
                                                    border: "1px solid black",
                                                }}
                                            />
                                        </a>
                                        {openColorUpload ? (
                                            <div
                                                div
                                                style={{
                                                    position: "fixed",
                                                    zIndex: "2",
                                                    textAlign: "end",
                                                }}
                                            >
                                                <SketchPicker
                                                    color={colorUpload.rgb}
                                                    onChange={({ rgb, hex }) =>
                                                        setColorUpload({ ...colorUpload, rgb, hex })
                                                    }
                                                />
                                                <footer className="footer-color">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setOpenColorUpload(!openColorUpload)}
                                                    >
                                                        save
                                                    </button>
                                                </footer>
                                            </div>
                                        ) : null}
                                    </Form.Item>

                                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                        <Button type="primary" htmlType="submit">
                                            บันทึก
                                        </Button>
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
                placement={"left"}
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
                placement={"left"}
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

          .ant-collapse-ghost
            > .ant-collapse-item
            > .ant-collapse-content
            > .ant-collapse-content-box {
            padding-top: 0px;
            padding-bottom: 0px;
          }

          .ant-drawer-mask{
            background-color: rgb(0 0 0 / 0%);
          }
        `}
            </style>
        </Layout>
    );
};

export default mapPage;
