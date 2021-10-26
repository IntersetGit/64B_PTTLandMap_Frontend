import Layout from "../components/_App/Layout";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Doughnut } from "react-chartjs-2";
import {
    Drawer,
    Tabs,
    Col,
    Collapse,
    Modal,
    Row,
    Card,
    Form,
    Input,
    Select,
    Upload,
    Button,
    message,
    Switch,
    Slider,
    Tooltip
} from "antd";
import Head from "next/head";
import { useSelector } from "react-redux";
import { SketchPicker } from "react-color";
import { CaretRightOutlined, UploadOutlined, EditFilled, ExpandOutlined, EyeFilled } from "@ant-design/icons";
import API from "../util/Api";
import RefreshToken from "../util/RefreshToken";
import axios from "axios";
import { Cookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import Timeslide from "../components/Timeslider";

const cookies = new Cookies();

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Meta } = Card;

const { Option } = Select;
const mapPage = () => {
    const [map, setMap] = useState(null);
    const [mapLeft, setMapLeft] = useState(null);
    const [mapRight, setMapRight] = useState(null);
    const googlemap = useRef(null);
    const { user } = useSelector(({ user }) => user);
    const centerMap = { lat: 13.78, lng: 100.55 }
    const [layerData, setLayerData] = useState([])

    const [slidemapshow, setSlidemapshow] = useState(false);
    const [ismenu, setIsmenu] = useState(null);
    /* จ อ ต */

    const [provAmpTamAll, setProvAmpTamAll] = useState({
        prov: [],
        amp: [],
        tam: [],
    })
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subDistrictList, setSubDistrictList] = useState([])
    const [statusProject, setStatusProject] = useState([])

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
                streetViewControl: {
                    streetViewControl: false
                }
            });
            setMap(_map);
            google.maps.event.addListener(_map, "mousemove", (event) => {
                getLatLon(event);
            });
            clickMapShowLatLag(_map)
        });
        loadShapeFile()
        loadGetShapeProvince()

        var cursor = document.getElementById("cursor");
        document.addEventListener("mousemove", (e) => {
            var x = e.clientX;
            var y = e.clientY;
            cursor.style.left = x + "px";
            cursor.style.top = y + "px";
        })
        getMasStatusProject()
    }, []);

    const getMasStatusProject = async () => {
        try {
            const { data } = await API.get(`masterdata/masStatusProject`)
            // console.log('data.items :>> ', data.items);
            setStatusProject(data.items)
        } catch (error) {

        }
    }
    const loadGetShapeProvince = async (layer_group = "f942a946-3bcb-4062-9207-d78ab437edf3") => {
        try {
            const { data } = await API.get(`/shp/getShapeProvince?layer_group=${layer_group}`)
            const { prov, amp, tam } = data.items
            // console.log('data.items :>> ', data.items);
            setProvAmpTamAll({
                ...provAmpTamAll, prov, amp, tam
            })
            setProvinceList(prov)
            setDistrictList(amp)
            setSubDistrictList(tam)
        } catch (error) {

        }
    }

    const onChangeProv = (value, _form) => {
        const find_prov = provAmpTamAll.prov.find(e => e.name == value)
        if (find_prov) {
            const ampList = provAmpTamAll.amp.filter(e => e.prov_id == find_prov.id)
            setDistrictList(ampList)
        }

        /* subDistrict */
        setSubDistrictList([])
        if (_form) _form.setFieldsValue({ ..._form, amp: null, tam: null })

    }

    const onChangeAmp = (value, _form) => {
        let find_amp = provAmpTamAll.amp.find(e => e.name == value), provList
        if (find_amp) {
            const tamList = provAmpTamAll.tam.filter(e => e.amp_id == find_amp.id)
            setSubDistrictList(tamList)
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

    const clickHome = () => {
        map.setCenter(centerMap);
        map.setZoom(8)
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
    const [layerList, setLayerList] = useState([]);
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

    const onFinishFailedUpload = (error) => {
        message.error("มีบางอย่างผิดพลาด !");
    };

    const loadShapeFile = async () => {
        try {
            const refresh_token = cookies.get('refresh_token');
            await RefreshToken(refresh_token);
            const { data } = await API.get(`/shp/getDataLayer`)
            // console.log('data :>> ', data);
            data.items.forEach((e, i) => {
                // if (i === 0)
                //     e.symbol = e.symbol ?? "http://10.224.163.53:9000/uploads/symbol_group/d8f2f089-7476-4337-b579-ca3cb30971a9.jpg"
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

            /* layerList */
            const find = data.items.find(e => e.id === "f942a946-3bcb-4062-9207-d78ab437edf3")
            if (find) setLayerList(find.children)

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

        changeColor(arr[index1].children[index2].id, arr[index1].children[index2].color_layer,)

    };

    const checkboxLayer = async (value, index1, index2) => {
        const arr = [...groupLayerList]
        arr[index1].children[index2].checked = value
        if (!value) {
            arr[index1].children[index2].checked = value
            clearMapData(arr[index1].children[index2].id)
        } else {
            const item = arr[index1].children[index2];
            await getDeoJson(item.id, item.color_layer)
        }
        setGroupLayerList(arr)
    };


    const changeColor = (id, color) => {
        const arr = [...layerData]
        const index = arr.findIndex(e => e.id == id)
        if (index != -1) {
            const layer = arr[index].layer
            layer.setStyle({
                fillColor: color,
                opacity: 0.5,
                strokeWeight: 1,
                clickable: false
            });
        }
    }

    const goTolayer = (id, type) => {
        const arr = (type == "search") ? [...layerSearchData] : [...layerData]
        const index = arr.findIndex(e => e.id == id)
        if (index != -1) {
            const layer = arr[index].layer
            const bounds = new google.maps.LatLngBounds();
            layer.forEach((feature) => {
                feature.getGeometry().forEachLatLng((latlng) => {
                    bounds.extend(latlng);
                });
            });
            map.fitBounds(bounds);
        }
    };

    const clearMapData = (id) => {
        const arr = [...layerData]
        const index = arr.findIndex(e => e.id == id)
        if (index != -1) {
            console.clear();
            const layer = arr[index].layer
            layer.forEach((feature) => {
                layer.remove(feature);
            });
            arr.splice(index, 1);
            setLayerData(arr)
        }
    }

    const getDeoJson = async (id, color) => {
        try {
            const { data } = await API.get(`/shp/shapeData?id=${id}`);
            const GeoJson = data.items.shape;
            // console.log('GeoJson :>> ', GeoJson);
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

            setLayerData([...layerData, { id, layer }])
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
            // console.log('_model :>> ', _model);
            await API.post(`/masterdata/masLayersShape`, _model)

            openColor(index1, index2)
        } catch (error) {
            message.error("มีบางอย่างผิดพลาด !");
        }
    };

    /*------------------------------------------------------------------------------ */
    /* Raster */
    const [visibleRaster, setVisibleRaster] = useState(false)
    const [rasterDataDron1, setRasterDataDron1] = useState([]) // ข้อมูล raster ภาพถ่ายจากดาวเทียม
    const [rasterDataDow1, setRasterDataDow1] = useState([]) // ข้อมูล raster ภาพถ่ายทางอากาศจากโดรน
    const [loadmore1, setLoadmore1] = useState({ dronMore: 3, dowMore: 3 })
    const [loadmore2, setLoadmore2] = useState({ dronMore: 3, dowMore: 3 })
    /* แสดง Loadmore ข้อมูลเพิ่มเตืม */
    const [showMoreDow, setShowMoreDow] = useState({ dow1: false, dow2: false }) //โชวLoadmore  ภาพถ่ายจากดาวเทียม
    const [showMoreDron, setShowMoreDron] = useState({ dron1: false, dron2: false }) //โชวLoadmore  ภาพถ่ายทางอากาศจากโดรน
    const openCloseRaster = async () => {
        let dron = []; //ภาพถ่ายทางอากาศจากโดรน
        let dow = []; //ภาพถ่ายจากดาวเทียม
        setVisibleRaster(!visibleRaster)
        if (!visibleRaster) {
            const respRaster = await API.get("/masterdata/datLayers")
            console.log(respRaster)
            respRaster.data.items.map(data => {
                if (data.image_type === "ภาพถ่ายจากดาวเทียม") {
                    dow.push(data)
                }
                if (data.image_type === "ภาพถ่ายทางอากาศจากโดรน") {
                    dron.push(data)
                }
            })
            setRasterDataDron1(dron)
            setRasterDataDow1(dow)
        }
    }
    /* open close fullscreen */
    const [fullscreen, setFullScreen] = useState(false);
    const openFullscreen = () => {
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
            setFullScreen(false);
        } else {
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
        }

    };

    /* open close Navbar */
    const [hideNavbar, setHideNavbar] = useState(false)
    const clickButtomHideNavbar = () => { //
        setHideNavbar(!hideNavbar)
    };
    const menuOpenFullscreen = () => {
        $("#openFullscreen").fadeToggle();
        $("#closeFullscreen").fadeToggle("slow");
    };
    /* click map show lat lag */
    const clickMapShowLatLag = (map) => {
        google.maps.event.addListener(map, "click", (event) => {

            let infoWindow = new google.maps.InfoWindow({
                content: `${event.latLng}`,
                position: event.latLng,
            })
            infoWindow.open(map)
        })
    }
    /* เปิดปิดเส้นวัดระยะ */
    const [openLine, setOpenLine] = useState(true) //ปุ่มเปิดปิด Line
    const [poly, setPoly] = useState(null);
    const [distanct, setDistanct] = useState(null);
    useEffect(() => {
        const symbolOne = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            strokeColor: "#000000",
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeWeight: 3,
        };

        let poly = new google.maps.Polyline({
            fillOpacity: 0,
            icons: [
                {
                    icon: symbolOne,
                    offset: "0%",
                },
                {
                    icon: {
                        path: "M 0,-1 0,1",
                        strokeOpacity: 1,
                        scale: 2,
                        rotation: 90,

                    },
                    offset: "10%",
                    repeat: "20px",
                },
                {
                    icon: symbolOne,
                    offset: "100%",
                },
            ],
        });
        setPoly(poly);
    }, []);
    const clickLine = () => {
        // setOpenLine(!openLine) // สลับปุ่มเปิดปิด
        // google.maps.event.clearListeners(map, 'click');
        // const distance = []
        // let count = 0 //นับจำนวนครั้งที่กด วัดระยะ
        // let max = [] //รวมระยะทางทั้งหมด
        // let sum = null
        // let infoWindow
        // let path
        // let markers = []
        // const service = new google.maps.DistanceMatrixService();

        // if (openLine) {
        //     poly.setMap(map);
        //     map.setOptions({ draggableCursor: 'crosshair' });

        //     map.addListener("click", async (event) => {
        //         if (count < 2) {
        //             count++
        //             // const marker = new google.maps.Marker({
        //             //     position: event.latLng,
        //             //     map: map
        //             // })
        //             // markers.push(marker)
        //             path = poly.getPath();
        //             path.push(event.latLng);
        //             if (count === 1) {
        //                 console.log(1);
        //                 origin = event.latLng
        //             }
        //             if (count === 2) {
        //                 console.log(2);
        //                 // destination = event.latLng
        //                 const request = {
        //                     origins: [origin],
        //                     destinations: [event.latLng],
        //                     travelMode: google.maps.TravelMode.DRIVING,
        //                     unitSystem: google.maps.UnitSystem.METRIC,
        //                     avoidHighways: false,
        //                     avoidTolls: false,
        //                 };
        //                 const test = await service.getDistanceMatrix(request)
        //                 if (test.rows[0].elements[0].distance !== undefined) {
        //                     // let infoWindow = await new google.maps.InfoWindow({
        //                     //     content: `ระยะทาง${test.rows[0].elements[0].distance.text}`,
        //                     //     position: destination,
        //                     // })
        //                     // infoWindow.open(map)
        //                     setDistanct(test.rows[0].elements[0].distance.text);
        //                 }
        //             }
        //         } else {
        //             path.forEach(i => path.pop())
        //             // for (let i = 0; i < markers.length; i++) {
        //             //     markers[i].setMap(null);
        //             //     path.pop()
        //             // }
        //             // markers = []
        //             count = 0
        //             setDistanct(null)
        //         }
        //         // count++
        //     })
        // } else {
        //     let path = poly.getPath();
        //     path.forEach(i => path.pop())
        //     map.setOptions({ draggableCursor: 'default' });
        //     google.maps.event.clearListeners(map, 'click');
        //     setDistanct(null)

        //     // clickMapShowLatLag(map)
        // }
        setOpenLine(!openLine) // สลับปุ่มเปิดปิด
        google.maps.event.clearListeners(map, 'click');
        var distance = [] //เก็บ lat lag แต่ละครั้ง
        var count = 0 //นับจำนวนครั้งที่กด วัดระยะ
        let max = [] //รวมระยะทางทั้งหมด
        let sum = null //เก็บผลรวมระยาทาง
        let path
        const service = new google.maps.DistanceMatrixService();
        if (openLine) {
            poly.setMap(map);
            map.setOptions({ draggableCursor: 'crosshair' });
            map.addListener("click", async (event) => {
                path = poly.getPath();
                path.push(event.latLng);
                distance.push(event.latLng.toJSON())
                if (count > 0) {
                    const request = await {
                        origins: [distance[count - 1]],
                        destinations: [distance[count]],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        avoidHighways: false,
                        avoidTolls: false,
                    };
                    const test = await service.getDistanceMatrix(request)
                    if (test.rows[0].elements[0].distance !== undefined) {
                        max.push(parseFloat(test.rows[0].elements[0].distance.text))
                        sum = max.reduce((a, b) => a + b, 0)
                        setDistanct(`ระยะทาง${sum.toFixed(2)}`);
                    }
                }
                count++ //เพิ่มจำนวนครั้งที่กด
            })
        } else {
            let path = poly.getPath();
            path.forEach(i => path.pop())
            map.setOptions({ draggableCursor: 'default' });
            google.maps.event.clearListeners(map, 'click');
            setDistanct(null)
            clickMapShowLatLag(map)
        }
    }
    /* เคลียเมพ */
    const clickClearMap = () => {
        var clearMap = new google.maps.Map(googlemap.current, {
            mapTypeControl: false,
            fullscreenControl: false,
            center: map.getCenter(),
            zoom: map.getZoom(),
        });
        setMap(clearMap)
    }
    /* เปิดปิดสวิทเมพ */
    const [changmap, setChangeMap] = useState(false) // ปุ่มเปิดปิด split map
    const googlemapLeft = useRef(null)
    const googlemapRight = useRef(null)
    const [count, setCount] = useState(false)

    const clickSplit = async () => {
        setChangeMap(!changmap)
        setCount(true)
        if (!count) {
            let mapLeft, mapRight;
            const mapOptions = await {
                zoom: 8,
                scaleControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                center: map.getCenter(),
                // center: centerMap,
            };

            // instantiate the map on the left with control positioning
            mapLeft = await new google.maps.Map(googlemapLeft.current, {
                ...mapOptions,
                mapTypeId: "satellite",
            });
            // instantiate the map on the right with control positioning
            mapRight = await new google.maps.Map(googlemapRight.current, {
                ...mapOptions,
                fullscreenControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                },
            });
            setMapLeft(mapLeft);
            setMapRight(mapRight);
            // helper function to keep maps in sync
            function sync(...maps) {
                let center, zoom;

                function update(changedMap) {
                    maps.forEach((m) => {
                        if (m === changedMap) {
                            return;
                        }

                        m.setCenter(center);
                        m.setZoom(zoom);
                    });
                }

                maps.forEach((m) => {
                    m.addListener("bounds_changed", () => {
                        const changedCenter = m.getCenter();
                        const changedZoom = m.getZoom();

                        if (changedCenter !== center || changedZoom !== zoom) {
                            center = changedCenter;
                            zoom = changedZoom;
                            update(m);
                        }
                    });
                });

            }

            sync(mapLeft, mapRight);

            function handleContainerResize() {
                const width = document.getElementById("container").offsetWidth;

                document.getElementById("map-left").style.width = `${width}px`;
                document.getElementById("map-right").style.width = `${width}px`;
            }

            // trigger to set map container size since using absolute
            handleContainerResize();
            // add event listener
            window.addEventListener("resize", handleContainerResize);
            //@ts-ignore
            Split(["#left", "#right"], {
                sizes: [50, 50],
            });
        } else {
            // console.log(mapRight);
            mapRight.setCenter(map.getCenter());
            mapRight.setZoom(map.getZoom());
        }
    }
    /* change map */
    const [imgChangeMap, setImgChangeMap] = useState("https://images.adsttc.com/media/images/6141/d09d/f91c/8104/f800/009b/large_jpg/Feature_Image.jpg?1631703175")
    const [txtChangeMap, setTextChangeMap] = useState("Satellite")
    const [changeMapButtom, setChangeMapButtom] = useState(false)
    const [buttomChangeMap, setButtomChangeMap] = useState({ terrain: false, traffic: false, transit: false }) //เมื่อคลิกที่ปุ่มไหนอยู่ จะเป็น true (ปุ่มterrain traffic transit)
    const [clickButtomChangeMap, setClickButtomChangeMap] = useState({ statellite: false, map: true })
    const clickChangeMap = () => {
        setChangeMapButtom(!changeMapButtom)
        if (!changeMapButtom) {
            map.setMapTypeId(google.maps.MapTypeId.HYBRID)
            setTextChangeMap("satellite")
            setClickButtomChangeMap({ statellite: true, map: false })
            setImgChangeMap("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwyYk7BSUClNOfiGhMybXiO4KbV0xOI8nOg_Qy9T9quhUOT4fNB8ZcUrcTPinYtaEsLFU&usqp=CAU")
            if (buttomChangeMap.terrain) {
                map.setMapTypeId("terrain");
            }
        } else {
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
            setTextChangeMap("Map")
            setClickButtomChangeMap({ statellite: false, map: true })
            setImgChangeMap("https://images.adsttc.com/media/images/6141/d09d/f91c/8104/f800/009b/large_jpg/Feature_Image.jpg?1631703175")
            if (buttomChangeMap.terrain) {
                map.setMapTypeId("terrain");
            }
        }
    }
    const [buttonMap, setbuttonMap] = useState(null)
    useEffect(() => {
        setbuttonMap({ traffic: new google.maps.TrafficLayer(), transit: new google.maps.TransitLayer() })
    }, [])
    const changeMap = async (info) => {
        switch (info) {
            case "Terrain":
                if (buttomChangeMap.terrain) {
                    setButtomChangeMap({ ...buttomChangeMap, terrain: false })
                    $(".terrain").css("background-color", "white")
                    if (clickButtomChangeMap.statellite) {
                        map.setMapTypeId(google.maps.MapTypeId.HYBRID)
                    } else {
                        map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
                    }
                } else {
                    map.setMapTypeId("terrain");
                    setButtomChangeMap({ ...buttomChangeMap, terrain: true })
                    $(".terrain").css("background-color", "rgb(0, 102, 255)")
                }
                break;
            case "Traffic":
                if (buttomChangeMap.traffic) {
                    buttonMap.traffic.setMap(null)
                    setButtomChangeMap({ ...buttomChangeMap, traffic: false })
                    $(".traffic").css("background-color", "white")
                } else {
                    buttonMap.traffic.setMap(map)
                    setButtomChangeMap({ ...buttomChangeMap, traffic: true })
                    $(".traffic").css("background-color", "rgb(0, 102, 255)")
                }
                break;
            case "Transit":
                if (buttomChangeMap.transit) {
                    buttonMap.transit.setMap(null)
                    setButtomChangeMap({ ...buttomChangeMap, transit: false })
                    $(".transit").css("background-color", "white")
                } else {
                    buttonMap.transit.setMap(map)
                    setButtomChangeMap({ ...buttomChangeMap, transit: true })
                    $(".transit").css("background-color", "rgb(0, 102, 255)")
                }
                break
            default:
                break;
        }
    }

    /* วัดขนาดพื่นที่ */

    const [drawings, setDrawings] = useState([]);
    var selectedShape;


    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }

    function setSelection(shape) {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);

    }

    function deleteSelectedShape() {
        if (selectedShape) {
            selectedShape.setMap(null);
        }
    }

    function deleteAllShape() {
        for (var i = 0; i < drawings.length; i++) {
            removePolygonInfoWindow(drawings[i].overlay.labels);
            drawings[i].overlay.setMap(null);
        }
        // drawings = [];
        setDrawings([])
    }
    function attachPolygonInfoWindow(polygon) {
        if (!polygon.labels) polygon.labels = [];
        for (var i = 0; i < polygon.labels.length; i++) {
            polygon.labels[i].setMap(null);
        }
        polygon.labels = [];
        var path = polygon.getPath();
        var points = path.getArray();
        var area = google.maps.geometry.spherical
            .computeArea(path.getArray())
            .toFixed(0);
        var bounds = new google.maps.LatLngBounds();
        var i;

        for (i = 0; i < points.length; i++) {
            bounds.extend(points[i]);
        }

        var boundsCenter = bounds.getCenter();
        var centerLabel = new MapLabel({
            map: map,
            fontSize: 13,
            align: "center"
        });

        polygon.labels.push(centerLabel);

        centerLabel.set("position", bounds.getCenter());
        centerLabel.set("text", area + "ตร.ม");
        if (path.getLength() < 2) return;
        for (var i = 0; i < polygon.getPath().getLength(); i++) {
            // for each side in path, compute center and length
            var start = polygon.getPath().getAt(i);
            var end = polygon.getPath().getAt(i < polygon.getPath().getLength() - 1 ? i + 1 : 0);
            var sideLength = google.maps.geometry.spherical.computeDistanceBetween(start, end);
            var sideCenter = google.maps.geometry.spherical.interpolate(start, end, 0.5);
            var sideLabel = new MapLabel({
                map: map,
                fontSize: 13,
                align: "center"
            });
            sideLabel.set("position", sideCenter);
            sideLabel.set("text", sideLength.toFixed(2) + "ม");
            polygon.labels.push(sideLabel);
        }
    }
    function removePolygonInfoWindow(labels) {
        for (var i = 0; i < labels.length; i++) {
            labels[i].setMap(null);
        }
        labels = [];
    }
    const areaDistance = () => {

        deleteAllShape();
        const drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: false,
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            polygonOptions: {
                // strokeWeight: 1,
                fillOpacity: 0.3,
                editable: true,
                draggable: true,
                fillColor: "#F54",

            },
            map: map
        });
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
            // drawings.push(e);
            setDrawings([...drawings, e])
            var newShape = e.overlay;
            newShape.type = e.type;
            drawingManager.setDrawingMode(null);
            if (e.type == 'polygon') {
                var path = newShape.getPath();
                google.maps.event.addListener(path, "insert_at", function () {
                    attachPolygonInfoWindow(newShape);
                });

                google.maps.event.addListener(path, "set_at", function () {
                    attachPolygonInfoWindow(newShape);
                });

                attachPolygonInfoWindow(newShape);

                google.maps.event.addListener(newShape, 'click', function () {
                    setSelection(newShape);
                });
                setSelection(newShape);
            }

        });

    }

    const test = () => {
        $("#changeMap").fadeIn()
        setTimeout(() => {
            $("#changeMap").fadeOut()
        }, 15000)
    }
    /* -------------------------------------------------------------------------------------- */

    /* Search */
    const [visibleSearch, setVisibleSearch] = useState(false);
    const [formSearch] = Form.useForm();
    const [searchList, setSearchList] = useState([])
    const [layerSearchData, setLayerSearchData] = useState([])
    const [sumData, setSumData] = useState(10)
    const [amount, setAmount] = useState(0)
    const [searchAllList, setSearchAllList] = useState([])
    const [firstSearc, setFirstSearc] = useState(true)

    const onFinishSearch = (value) => {
        apiSearchData({ ...value })
    }

    const onFinishFailedSearch = (error) => {
        console.log('error :>> ', error);
    }

    const apiSearchData = async ({ layer_group = "", project_name = "", prov = "", search = "", tam = "", amp = "" }) => {
        try {
            let url = `/shp/getSearchData?temp=1`
            if (layer_group) url += `&layer_group=${layer_group}`
            if (project_name) url += `&project_name=${project_name}`
            if (prov) url += `&prov=${prov}`
            if (search) url += `&search=${search}`
            if (tam) url += `&tam=${tam}`
            if (amp) url += `&amp=${amp}`

            const { data } = await API.get(url)
            const _arr = []
            setAmount(data.items.amount_data)
            setSumData(10)
            data.items.data.forEach((e, i) => {
                e.index = i + 1;
                e.status = e.status.toString()
                // if (e.color) {
                //     const rgb = JSON.parse(e.color)
                //     e.color = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
                // }
                if (i < 10) _arr.push(e)
            })
            setSearchList(_arr)
            setSearchAllList(data.items.data)

        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const switchGeom = async (value, item, i) => {
        // console.log('value :>> ', value);
        item.checked = value
        const _searchList = [...searchList]
        _searchList[i] = item
        setSearchList([..._searchList])

        if (!value) {
            const arr = [...layerSearchData]
            const index = arr.findIndex(e => e.id == item.index)
            if (index != -1) {
                const layer = arr[index].layer
                layer.forEach((feature) => {
                    layer.remove(feature);
                });
                arr.splice(index, 1);
                setLayerSearchData(arr)
            }
        } else {
            const { data } = await API.get(`/shp/getByIdShape?id=${item.gid}&table_name=${item.table_name}`);
            const GeoJson = data.items.shape;
            // console.log('GeoJson :>> ', GeoJson);
            const bounds = new google.maps.LatLngBounds();
            const layer = new google.maps.Data();
            layer.addGeoJson(GeoJson)


            layer.addGeoJson(GeoJson)
            layer.setStyle({
                fillColor: item.color,
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

            setLayerSearchData([...layerSearchData, { id: item.index, layer }])
            map.fitBounds(bounds);
        }
    };

    const pushSearchData = () => {
        const _arr = [...searchList]
        searchAllList.forEach((e, i) => {
            const index = i + 1
            if (index > sumData && index <= sumData + 10) _arr.push(e)
        })
        setSearchList(_arr)
        setSumData(sumData + 10)

    }

    const editShapefileSearch = (item, index) => {
        console.log('item :>> ', item);
        const formData = []
        const setFieldsValue = {}

        const disabled = ["gid", "table_name"],
            required = ["project_na", "status"],
            hide = ["index", "color", "checked"],
            select = ["status"],
            sort = []

        for (const [key, value] of Object.entries(item)) {
            // console.log(`${key}:key`);
            // console.log(`${value}:value`);
            if (typeof value != "object" && !(hide.find(x => x == key))) {
                const obj = {}
                obj.label = key.toUpperCase()
                obj.name = key;
                obj.required = required.find(x => x == key) ? true : false;
                obj.disabled = disabled.find(x => x == key) ? true : false;
                obj.message = `Please input your ${key}!`;
                obj.type = `input`
                if (select.find(x => x == key)) {
                    obj.type = `select`
                    obj.list = statusProject
                    obj.value = "status_code"
                    obj.text = "name"
                }
                formData.push(obj)
                setFieldsValue[key] = value
            }
        }
        // console.log('formData :>> ', formData);
        // console.log('setFieldsValue :>> ', setFieldsValue);
        setFormDataShapefile([...formData])
        formModalSearch.setFieldsValue(setFieldsValue)
        setVisibleModalSearch(true)
    }

    /* Modal Search */
    const [visibleModalSearch, setVisibleModalSearch] = useState(false)
    const [formDataShapefile, setFormDataShapefile] = useState([])
    const [formModalSearch] = Form.useForm();

    const handleOkModalSearch = () => {
        formModalSearch.submit()
    }

    const handleCancelModalSearch = () => {
        setVisibleModalSearch(false)
    }

    const onFinishModalSearch = async (value) => {
        try {
            value.id = value.gid
            // console.log('value :>> ', value);
            await await API.post(`/shp/editShapeData`, value);
            const _searchList = [...searchList];
            const index = _searchList.findIndex(e => e.gid == value.gid)
            if (index != -1) {
                _searchList[index] = { ..._searchList[index], ...value }
                setSearchList([..._searchList])
            }
            setVisibleModalSearch(false)
        } catch (error) {
            console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาด !");
        }
    }

    const onFinishFailedModalSearch = (error) => {
        console.log('error :>> ', error);
    }


    /* Dashboard */
    const [visibleDashboard, setVisibleDashboard] = useState(false);
    const [formDashboard] = Form.useForm();
    const [plotDashboard, setPlotDashboard] = useState({
        labels: [],
        datasets: [],
        list: [],
    })
    const [distanceDashboard, setDistanceDashboard] = useState({
        labels: [],
        datasets: [],
        list: [],
    })

    const onFinishDashboard = (value) => {
        // console.log('value :>> ', value);
        apiDashboardData({ ...value })
    }

    const onFinishFailedDashboard = (error) => {
        console.log('error :>> ', error);
    }


    const apiDashboardData = async ({ layer_group = "", project_name = "", prov = "", search = "", tam = "", amp = "" }) => {
        try {
            let url = `/shp/getFromProjectMap?temp=1`
            if (layer_group) url += `&layer_group=${layer_group}`
            if (project_name) url += `&project_name=${project_name}`
            if (prov) url += `&prov=${prov}`
            if (search) url += `&search=${search}`
            if (tam) url += `&tam=${tam}`
            if (amp) url += `&amp=${amp}`

            const { data } = await API.get(url)
            // console.log('data :>> ', data.items);

            const { plot, distance } = data.items

            /* plot */
            const _plotDashboard = {
                labels: [],
                datasets: [{
                    label: 'แปลง',
                    data: [],
                    backgroundColor: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue',
                    ],
                }],
                list: [],
            }

            _plotDashboard.labels = plot.status
            plot.data.forEach((e, i) => {
                _plotDashboard.datasets[0].data.push(e)
                _plotDashboard.list[i] = {
                    name: plot.status[i],
                    value: e
                }
            })

            setPlotDashboard({ ..._plotDashboard })

            /* distance */
            const _distanceDashboard = {
                labels: [],
                datasets: [{
                    label: 'ระยะทาง',
                    data: [],
                    backgroundColor: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue',
                    ],
                }],
                list: [],
            }
            _distanceDashboard.labels = distance.status
            distance.data.forEach((e, i) => {
                _distanceDashboard.datasets[0].data.push(e)
                _distanceDashboard.list[i] = {
                    name: distance.status[i],
                    value: e
                }
            })

            setDistanceDashboard({ ..._distanceDashboard })

        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const option = {
        responsive: true,
        legend: {
            display: false
        },
        plugins: {
            legend: {
                position: 'start',
            },
        }
    }
    const ontimeslider = () => {
        setSlidemapshow(!slidemapshow)
    }
    // -------------------------------------------WMS----------------------------
    const [selectwms, setSelectwms] = useState([])
    const [selectwmsright, setSelectwmsright] = useState([])
    const [wmsopacity, setWmsopacity] = useState(100);
    const [wmsopacityright, setWmsopacityright] = useState(100);

    const Clickwms = (items, Map = map) => {
        // console.log('itemswms :>> ', items);

        let maptype = new WmsMapType(
            items.id,
            items.url, {
            layers: items.layer_name,
            wmsProjectKey: items.id,
        }, {
            opacity: wmsopacity / 100
        }, items.type_server
        );
        // console.log('maptype :>> ', maptype);
        if (Map == map || Map == mapLeft) {
            if (selectwms.some((item) => item.name == maptype.name)) {
                let cut = selectwms.filter((item) => item.name !== maptype.name)
                setSelectwms(cut);
                maptype.removeFromMap(Map);
            } else {
                setSelectwms([...selectwms, maptype]);
                maptype.addToMap(Map);
            }
        } else {
            if (selectwmsright.some((item) => item.name == maptype.name)) {
                let cut = selectwmsright.filter((item) => item.name !== maptype.name)
                setSelectwmsright(cut);
                maptype.removeFromMap(Map);
            } else {
                setSelectwmsright([...selectwmsright, maptype]);
                maptype.addToMap(Map);
            }
        }
    }
    useEffect(() => {
        selectwms.forEach((layer) => {
            layer.removeFromMap(map);
            layer.removeFromMap(mapLeft);
        })
        selectwmsright.forEach((layer) => {
            layer.removeFromMap(mapRight);
        })
        setSelectwms([]);
        setSelectwmsright([]);
    }, [changmap])

    useEffect(() => {
        selectwms.forEach((wms) => {
            wms.setOpacity(wmsopacity / 100);
        })
    }, [wmsopacity]);
    useEffect(() => {
        selectwmsright.forEach((wms) => {
            wms.setOpacity(wmsopacityright / 100);
        })
    }, [wmsopacityright]);


    return (
        <Layout isMap={true} navbarHide={hideNavbar}>
            <Head>
                <title>PTT Land Map</title>
            </Head>
            <div id="cursor" style={distanct && { borderRadius: "10%", padding: "5px", backgroundColor: "#FFF" }}>{distanct}</div>
            <Timeslide onClose={() => setSlidemapshow(false)} visible={slidemapshow} />
            <div className="tools-group-layer">
                <Tooltip placement="topRight" title={"Gis Layer"}>
                    <button className="btn btn-light btn-sm" onClick={() => setVisibleShapeFile(true)}>
                        {/* <i className="fa fa-window-restore" /> */}
                        <img width="100%" src="/assets/images/fa-window-restore.png" alt="" />
                    </button>
                </Tooltip>
            </div>
            <div className="tools-dashboard">
                <Tooltip placement="topRight" title={"Dashboard"}>
                    <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                            setVisibleDashboard(true)
                            apiDashboardData({ project_name: "project_na" })
                        }}
                    >
                        {/* <i className="fa fa-dashboard" /> */}
                        <img width="100%" src="/assets/images/fa-dashboard.png" alt="" />
                    </button>
                </Tooltip>
            </div>

            <div className="map-info-area">
                <div className="map-info-detail">
                    <span>
                        Lat/Long <span id="latLong" /> UTM <span id="utm" />
                    </span>
                </div>
            </div>

            <div className="tools-map-cog" onClick={() => openCloseRaster()}>
                <Col span={6}>
                    {/* <i
                        className="fa fa-cog"
                        style={{ fontSize: "20px", marginTop: "2.5px" }}
                        id="config-map-cog"
                    /> */}
                    <Tooltip placement="left" title={"Images Layer"}>
                        <img src="assets/images/layer.PNG" alt="" width="23" />
                    </Tooltip>
                </Col>
            </div>

            <div className="tools-map-area">
                {/* Administrator And Editor */}
                {user &&
                    (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" ||
                        user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4") ? (
                    !changmap && <Col span={6}>
                        <Tooltip
                            placement="left" title={"Search"}
                        >
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                    if (firstSearc) {
                                        apiSearchData({ project_name: "project_na" })
                                        setFirstSearc(false)
                                    }
                                    setVisibleSearch(!visibleSearch)
                                }}
                            >
                                <img width="100%" src="/assets/images/search.png" />
                            </button>
                        </Tooltip>
                    </Col>

                ) : null}

                {!changmap && <Col span={6} className="pt-2">
                    <Tooltip placement="left" title={"Default"}>
                        <button className="btn btn-light btn-sm" onClick={clickHome} >
                            <img
                                width="100%"
                                src="/assets/images/home.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-2">
                    <Tooltip placement="left" title={"Distance"}>
                        <button className="btn btn-light btn-sm" onClick={clickLine} >
                            <img
                                width="100%"
                                src="/assets/images/Line.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={areaDistance} >
                        <img
                            width="100%"
                            src="/assets/images/polegon.png"
                            title="area distance"
                        />
                    </button>
                </Col>}
                <Col span={6} className="pt-2">
                    <Tooltip placement="left" title={"Swipe Map"}>
                        <button className="btn btn-light btn-sm" onClick={clickSplit}>
                            <img
                                width="100%"
                                src="/assets/images/-line_icon.png"
                            />
                        </button>
                    </Tooltip>
                </Col>
                {!changmap && <Col span={6} className="pt-2">
                    <Tooltip placement="left" title={"Time Silder"}>
                        <button className="btn btn-light btn-sm" onClick={ontimeslider} >
                            <img
                                width="100%"
                                src="/assets/images/arrow_back_time.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-2">
                    <Tooltip placement="left" title={"Clear"}>
                        <button className="btn btn-light btn-sm" onClick={clickClearMap} >
                            <img
                                width="100%"
                                src="/assets/images/cross.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
            </div>
            <div className="tools-map-area2">
                <Col span={24} className="pt-2">
                    <Tooltip placement="bottom" title={"Menu Bar"}>
                        <button
                            className="btn btn-light btn-sm "
                            id="closeFullscreen"
                            style={{ display: "none" }}
                            onClick={() => clickButtomHideNavbar()}
                        >
                            <img
                                width="100%"
                                src="/assets/images/close_full_screen.png"
                            />
                        </button>
                    </Tooltip>
                    <Tooltip placement="bottom" title={"FullScreen"}>
                        <button
                            className="btn btn-light btn-sm"
                            id="openFullscreen"
                            style={{ display: "none" }}
                            onClick={() => openFullscreen()}
                        >
                            <img width="100%" src="/assets/images/open_full_screen.png" />
                        </button>
                    </Tooltip>
                    <Tooltip placement="bottom" title={"ScreenTools"}>
                        <button
                            className="btn btn-light btn-sm"
                            onClick={() => {
                                menuOpenFullscreen();
                            }}
                        >
                            <img
                                width="100%"
                                src="/assets/images/menu_full_screen.png"
                            />
                        </button>
                    </Tooltip>
                </Col>
            </div>
            <div className="tools-map-area3" hidden={changmap} >
                <button className="btn btn-light" onClick={() => clickChangeMap()} onMouseOver={() => test()} >
                    <img width="90" height="90" style={{ borderRadius: "10px" }} src={imgChangeMap} alt="" />
                    <span style={{ position: "absolute", bottom: "15px", left: "25px", textAlign: "center" }}>
                        {txtChangeMap}
                    </span>
                </button>
                <div id="changeMap" style={{ display: "none" }} >
                    <span style={{ display: "flex", justifyContent: "space-around" }} >
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                            <button className="btn btn-light btn-sm terrain" onClick={() => changeMap("Terrain")} >
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Terrain.png" alt="" />
                            </button>
                            <h5 className="text-info" >Terrain</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm traffic" onClick={() => changeMap("Traffic")} >
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Traffic.png" alt="" />
                            </button>
                            <h5 className="text-info" >Traffic</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm transit" onClick={() => changeMap("Transit")}>
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Transit.png" alt="" />
                            </button>
                            <h5 className="text-info" >Transit</h5>
                        </span>
                    </span>
                </div>

            </div>
            {/* -------------------------------------Map-------------------------------------------- */}
            <div id="map" ref={googlemap} hidden={changmap} />
            <div id="container" hidden={!changmap}>
                <div id="left">
                    <div id="map-left" className="map" ref={googlemapLeft}></div>
                </div>
                <div id="right">
                    <div id="map-right" className="map" ref={googlemapRight}></div>
                </div>
            </div>
            {/* -----------------------------------------------------------------------------------  */}
            {/* Shape File */}
            <Drawer
                width={350}
                placement={"left"}
                visible={visibleShapeFile}
                onClose={() => setVisibleShapeFile(false)}
                maskClosable={false}
                style={{ width: visibleShapeFile ? 350 : 0 }}
            >
                <Tabs>
                    <TabPane tab="ชั้นข้อมูล" key="1">
                        {groupLayerList.map((e, i) =>
                            Object.assign(
                                <div className="pt-2" key={`maps-${e.id}`}>
                                    <Collapse
                                        expandIcon={({ isActive }) => e.symbol ? <img src={e.symbol} width={20} /> : <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                    >
                                        <Panel header={e.group_name} key={i}>
                                            {e.children
                                                ? e.children.map((x, index) =>
                                                    Object.assign(
                                                        <div className="pt-2" key={`children-${x.id}`}>
                                                            <Row>
                                                                <Col xs={19}>
                                                                    <Switch size="small" checked={x.checked} onChange={(value) => checkboxLayer(value, i, index)} /> {x.name_layer}
                                                                </Col>

                                                                <Col xs={2} >
                                                                    {
                                                                        x.checked ?
                                                                            <a onClick={() => goTolayer(x.id)}>
                                                                                <ExpandOutlined />
                                                                            </a> : null
                                                                    }
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
                                    </Collapse>
                                </div>
                            ))}
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
                                                <Option key={`groupLayerList-${e.id}`} value={e.id}>
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
                                            action={`${process.env.NEXT_PUBLIC_SERVICE}/demo/resTrue`}
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
                id="drawer-dashboard"
                width={750}
                title="Process ส่งมอบโครงการ"
                placement={"left"}
                visible={visibleDashboard}
                onClose={() => setVisibleDashboard(!visibleDashboard)}
                maskClosable={false}
                style={{ width: visibleDashboard ? 650 : 0 }}
            >
                <>
                    <div>
                        <Form
                            form={formDashboard}
                            initialValues={{
                                project_name: "project_na"
                            }}
                            onFinish={onFinishDashboard}
                            onFinishFailed={onFinishFailedDashboard}
                            layout="vertical"
                            autoComplete="off"
                        >
                            <div className="row">
                                <div className="col-4">
                                    <Form.Item
                                        label=""
                                        name="search"
                                    >
                                        <Input placeholder="Search" />
                                    </Form.Item>
                                </div>
                                <div className="col-3">
                                    <Form.Item
                                        label=""
                                        name="project_name"
                                    >
                                        <Select
                                            placeholder="ชื่อโครงการ"
                                            allowClear
                                        >
                                            <Option value="project_na">ชื่อโครงการ</Option>
                                            <Option value="objectid">เลขที่โฉนด</Option>
                                            <Option value="parlabel1">ลำดับแปลงที่ดิน</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-3">
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
                                </div>
                                <div className="col-2">
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            ค้นหา
                                        </Button>
                                    </Form.Item>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-4">
                                    <Form.Item
                                        label=""
                                        name="prov"
                                    >
                                        <Select
                                            placeholder="จังหวัด"
                                            allowClear
                                            onChange={(e) => onChangeProv(e, formDashboard)}
                                        >
                                            {provinceList.map(e => <Option key={`prov1-${e.id}`} value={e.name}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-4">
                                    <Form.Item
                                        label=""
                                        name="amp"
                                    >
                                        <Select
                                            placeholder="อำเภอ"
                                            allowClear
                                            onChange={(e) => onChangeAmp(e, formDashboard)}
                                        >
                                            {districtList.map(e => <Option key={`amp1-${e.id}`} value={e.name}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-4">
                                    <Form.Item
                                        label=""
                                        name="tam"
                                    >
                                        <Select
                                            placeholder="ตำบล"
                                            allowClear
                                            onChange={(e) => onChangeTam(e, formDashboard)}
                                        >
                                            {subDistrictList.map(e => <Option key={`tam1-${e.id}`} value={e.name}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>


                        </Form>
                    </div>
                    <hr />

                    <h3>แปลง</h3>
                    <div className="row">
                        <div className="col-8">
                            <Doughnut
                                data={{
                                    labels: plotDashboard.labels,
                                    datasets: plotDashboard.datasets
                                }}
                                options={option}
                            />
                        </div>
                        <div className="col-4">
                            {plotDashboard.list.map((e, i) => <p key={`plotDashboard-${i}`}>{e.name} : {e.value} แปลง</p>)}
                        </div>
                    </div>

                    <hr />

                    <h3>ระยะทาง</h3>
                    <div className="row">
                        <div className="col-8">
                            <Doughnut
                                data={{
                                    labels: distanceDashboard.labels,
                                    datasets: distanceDashboard.datasets
                                }}
                                options={option}
                            />
                        </div>
                        <div className="col-4">
                            {distanceDashboard.list.map((e, i) => <p key={`distanceDashboard-${i}`}>{e.name} : {e.value} ก.ม.</p>)}
                        </div>
                    </div>

                </>

            </Drawer>

            {/* Search */}
            <Drawer
                id="drawer-search"
                width={650}
                title="ต้นหา"
                placement={"left"}
                visible={visibleSearch}
                onClose={() => setVisibleSearch(!visibleSearch)}
                maskClosable={false}
                style={{ width: visibleSearch ? 650 : 0 }}
            >
                <div>
                    <Form
                        form={formSearch}
                        initialValues={{
                            project_name: "project_na"
                        }}
                        onFinish={onFinishSearch}
                        onFinishFailed={onFinishFailedSearch}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <div className="row">
                            <div className="col-4">
                                <Form.Item
                                    label=""
                                    name="search"
                                >
                                    <Input placeholder="Search" />
                                </Form.Item>
                            </div>
                            <div className="col-3">
                                <Form.Item
                                    label=""
                                    name="project_name"
                                >
                                    <Select
                                        placeholder="ชื่อโครงการ"
                                        allowClear
                                    >
                                        <Option value="project_na">ชื่อโครงการ</Option>
                                        <Option value="objectid">เลขที่โฉนด</Option>
                                        <Option value="parlabel1">ลำดับแปลงที่ดิน</Option>
                                    </Select>
                                </Form.Item>
                            </div>
                            <div className="col-3">
                                <Form.Item
                                    label=""
                                    name="layer_group"
                                >
                                    <Select
                                        placeholder="ชั้นข้อมูล"
                                        allowClear
                                    >
                                        {layerList.map(e => <Option key={`name-layer-${e.id}`} value={e.id}>{e.name_layer}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                            <div className="col-2">
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        ค้นหา
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-4">
                                <Form.Item
                                    label=""
                                    name="prov"
                                >
                                    <Select
                                        placeholder="จังหวัด"
                                        allowClear
                                        onChange={(e) => onChangeProv(e, formSearch)}
                                    >
                                        {provinceList.map(e => <Option key={`prov-${e.id}`} value={e.name}>{e.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                            <div className="col-4">
                                <Form.Item
                                    label=""
                                    name="amp"
                                >
                                    <Select
                                        placeholder="อำเภอ"
                                        allowClear
                                        onChange={(e) => onChangeAmp(e, formSearch)}
                                    >
                                        {districtList.map(e => <Option key={`amp-${e.id}`} value={e.name}>{e.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                            <div className="col-4">
                                <Form.Item
                                    label=""
                                    name="tam"
                                >
                                    <Select
                                        placeholder="ตำบล"
                                        allowClear
                                        onChange={(e) => onChangeTam(e, formSearch)}
                                    >
                                        {subDistrictList.map(e => <Option key={`tam-${e.id}`} value={e.name}>{e.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>


                    </Form>
                </div>
                <hr />

                <div>
                    <h4 className="pb-3">พบข้อมูลจำนวน <span className="text-red">{amount}</span> Recorde</h4>
                    {
                        searchList.map((e, i) => (
                            <div key={`SearchList-${i}`}>
                                {e.index})
                                <div className="row pt-2">
                                    <div className="col-1">
                                        <div
                                            style={{
                                                width: "25px",
                                                height: "25px",
                                                borderRadius: "2px",
                                                background: e.color,
                                                border: "1px solid black",
                                            }}
                                        />
                                    </div>
                                    <div className="col-11">

                                        <div className="row">
                                            <label>PROJECT_NAME :</label>
                                            <p className="pl-3">{e.project_na}</p>
                                        </div>

                                        <div className="row">
                                            <label>PARTYPE :</label>
                                            <p className="pl-3">{e.partype}</p>
                                        </div>

                                        <div className="pl-2">
                                            <div className="row">
                                                <div className="col-4">
                                                    <div className="row">
                                                        <label>PARLABEL1 :</label>
                                                        <p className="pl-3">{e.parlabel1}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="row">
                                                        <label>PARLABEL2 :</label>
                                                        <p className="pl-3">{e.parlabel2}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="row">
                                                        <label>PARLABEL3 :</label>
                                                        <p className="pl-3">{e.parlabel3}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-4">
                                                    <div className="row">
                                                        <label>PARLABEL4 :</label>
                                                        <p className="pl-3">{e.parlabel4}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="row">
                                                        <label>PARLABEL5 :</label>
                                                        <p className="pl-3">{e.parlabel5}</p>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <button className="btn" onClick={() => editShapefileSearch(e, i)}><EditFilled /></button>
                                                    <Switch size="small" checked={e.checked} onChange={(value) => switchGeom(value, e, i)} />
                                                    {e.checked ?
                                                        <button className="btn" onClick={() => goTolayer(e.index, "search")}>
                                                            <ExpandOutlined />
                                                        </button> : null}
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                </div>
                                <hr />
                            </div>
                        ))
                    }
                    <div style={{ textAlign: "center" }}>
                        {amount >= sumData ? <button className="btn btn-primary" onClick={pushSearchData}>โหลดเพิ่มเติม</button> : null}
                    </div>

                </div>
            </Drawer>

            {/* Modal Search */}
            <Modal
                maskClosable={false}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
                title="แก้ไข"
                visible={visibleModalSearch}
                onOk={handleOkModalSearch}
                onCancel={handleCancelModalSearch}
            >
                <Form
                    form={formModalSearch}
                    name="formModalSearch"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinishModalSearch}
                    onFinishFailed={onFinishFailedModalSearch}
                    autoComplete="off"
                >
                    {formDataShapefile.map((e, i) => (
                        <>
                            {e.type === "select" ? (
                                <Form.Item
                                    key={`form-modal-search-${i}`}
                                    label={e.label}
                                    name={e.name}
                                    rules={[{ required: e.required, message: e.message }]}
                                >
                                    <Select
                                        placeholder={e.label}
                                        allowClear
                                    >
                                        {e.list.map((x, index) => <Option key={`select-${e.name}-${index}`} value={x[e.value]}>{x[e.text]}</Option>)}
                                    </Select>
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    key={`form-modal-search-${i}`}
                                    label={e.label}
                                    name={e.name}
                                    rules={[{ required: e.required, message: e.message }]}
                                >
                                    <Input disabled={e.disabled} />
                                </Form.Item>
                            )}
                        </>
                    ))}
                </Form>
            </Modal>

            {/* ภาพถ่ายทางอากาศ */}
            <Drawer
                placement="right"
                onClose={() => openCloseRaster()}
                visible={visibleRaster}
                width={350}
                maskClosable={false}
                style={{ width: visibleRaster ? 350 : 0 }}
            >
                <Tabs defaultActiveKey="1" style={{ marginBottom: "100px" }}>
                    <TabPane tab={changmap ? <b>Left Layer WMS</b> : <b>WMS Layer</b>} key="1">
                        <b className="text-info" >ภาพถ่ายทางอากาศ </b>
                        <Row className="pt-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDron1.slice(0, loadmore1.dronMore).map((data, index) => {
                                    return (
                                        <Col key={`dronMore-${index}`} span={8} key={index} >
                                            <Card
                                                className={`${selectwms.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                                bodyStyle={{ padding: "5px", }}
                                                bordered={false}
                                                onClick={() => { !changmap ? Clickwms(data) : Clickwms(data, mapLeft) }}
                                                hoverable
                                                style={{ width: "100%", height: "100%", cursor: "pointer", }}
                                                cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${data.id}.jpg`} />}
                                            >
                                                <p style={{ flexWrap: "wrap" }}>{data.wms}</p>
                                                {
                                                    selectwms.some((item) => item.name == data.id) ?
                                                        <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                        : null
                                                }
                                            </Card>
                                        </Col>
                                    )
                                })
                            }
                            {
                                rasterDataDron1.length > 3 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDron.dron1} onClick={() => { setLoadmore1({ ...loadmore1, dronMore: rasterDataDow1.length }), setShowMoreDron({ ...showMoreDron, dron1: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <b className="text-info pt-5">ภาพถ่ายดาวเทียม</b>
                        <Row className="pt-3 pb-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDow1.slice(0, loadmore1.dowMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwms.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => { !changmap ? Clickwms(data) : Clickwms(data, mapLeft) }}
                                            hoverable
                                            style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                            cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${data.id}.jpg`} />}
                                        >
                                            <p style={{ flexWrap: "wrap" }}>{data.wms}</p>
                                            {
                                                selectwms.some((item) => item.name == data.id) ?
                                                    <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                    : null
                                            }
                                        </Card>
                                    </Col>
                                })
                            }
                            {
                                rasterDataDow1.length > 3 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDow.dow1} onClick={() => { setLoadmore1({ ...loadmore1, dowMore: rasterDataDow1.length }), setShowMoreDow({ ...showMoreDow, dow1: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <div style={{ position: "absolute", bottom: "0px", height: "70px", width: "300px", backgroundColor: "#f1eded", padding: "5px" }}>
                            <span><b>Brightness</b></span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
                                <span>🌘</span>
                                <Slider onChange={(e) => setWmsopacity(e)} defaultValue={100} disabled={false} style={{ width: "80%" }} />
                                <span>🌕</span>
                            </div>
                        </div>
                    </TabPane>
                    {changmap && <TabPane tab={<b>Right Layer WMS</b>} key="2">
                        <b className="text-info" >ภาพถ่ายทางอากาศ </b>
                        <Row className="pt-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDron1.slice(0, loadmore2.dronMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwmsright.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => Clickwms(data, mapRight)}
                                            hoverable
                                            style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                            cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${data.id}.jpg`} />}
                                        >
                                            <p style={{ flexWrap: "wrap" }}>{data.wms}</p>
                                            {
                                                selectwmsright.some((item) => item.name == data.id) ?
                                                    <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                    : null
                                            }
                                        </Card>

                                    </Col>
                                })
                            }
                            {
                                rasterDataDron1.length > 3 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDron.dron2} onClick={() => { setLoadmore2({ ...loadmore2, dronMore: rasterDataDow1.length }), setShowMoreDron({ ...showMoreDron, dron2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <b className="text-info pt-5">ภาพถ่ายดาวเทียม</b>
                        <Row className="pt-3 pb-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDow1.slice(0, loadmore2.dowMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwmsright.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => Clickwms(data, mapRight)}
                                            hoverable
                                            style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                            cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`${process.env.NEXT_PUBLIC_SERVICE}/uploads/satellite-aerial-photographs/${data.id}.jpg`} />}
                                        >
                                            <p style={{ flexWrap: "wrap" }}>{data.wms}</p>
                                            {
                                                selectwmsright.some((item) => item.name == data.id) ?
                                                    <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                    : null
                                            }
                                        </Card>
                                    </Col>
                                })
                            }
                            {
                                rasterDataDow1.length > 3 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDow.dow2} onClick={() => { setLoadmore2({ ...loadmore2, dowMore: rasterDataDow1.length }), setShowMoreDow({ ...showMoreDow, dow2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <div style={{ position: "absolute", bottom: "0px", height: "70px", width: "300px", backgroundColor: "#f1eded", padding: "5px" }}>
                            <span><b>Brightness</b></span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
                                <span>🌘</span>
                                <Slider onChange={(e) => setWmsopacityright(e)} defaultValue={100} disabled={false} style={{ width: "80%" }} />
                                <span>🌕</span>
                            </div>
                        </div>
                    </TabPane>
                    }
                </Tabs>
            </Drawer>
            <style global jsx>
                {`
          .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            position: relative;
            padding: 10px 0px;
          }

          .ant-drawer-mask{
            background-color: rgb(0 0 0 / 0%);
          }

          .col-4 , .col-3 {
            padding-right: 5px;
            padding-left: 5px;
          }
        `}
            </style>
        </Layout >
    );
};

export default mapPage;
