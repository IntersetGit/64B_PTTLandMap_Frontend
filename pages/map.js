import Layout from "../components/_App/Layout";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Doughnut } from "react-chartjs-2";
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
    Switch,
    Slider
} from "antd";
import Head from "next/head";
import { useSelector } from "react-redux";
import { SketchPicker } from "react-color";
import { CaretRightOutlined, UploadOutlined, EditFilled, EyeFilled } from "@ant-design/icons";
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
    const googlemap = useRef(null);
    const { user } = useSelector(({ user }) => user);
    const centerMap = { lat: 13.78, lng: 100.55 }
    const [layerData, setLayerData] = useState([])

    const [slidemapshow, setSlidemapshow] = useState(false);

    /* จ อ ต */

    const [provAmpTamAll, setProvAmpTamAll] = useState({
        prov: [],
        amp: [],
        tam: [],
    })
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subDistrictList, setSubDistrictList] = useState([])

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
            google.maps.event.addListener(_map, "mousemove", (event) => {
                getLatLon(event);
            });
            clickMapShowLatLag(_map)
        });
        loadShapeFile()
        loadGetShapeProvince()
    }, []);

    const loadGetShapeProvince = async (layer_group = "f942a946-3bcb-4062-9207-d78ab437edf3") => {
        try {
            const { data } = await API.get(`/shp/getShapeProvince?layer_group=${layer_group}`)
            const { prov, amp, tam } = data.items
            console.log('data.items :>> ', data.items);
            setProvAmpTamAll({
                ...provAmpTamAll, prov, amp, tam
            })
            setProvinceList(prov)
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
        const find_amp = provAmpTamAll.amp.find(e => e.name == value)
        if (find_amp) {
            const tamList = provAmpTamAll.tam.filter(e => e.amp_id == find_amp.id)
            setSubDistrictList(tamList)
        }
        if (_form) _form.setFieldsValue({ ..._form, tam: null })
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
            console.log('data :>> ', data.items);
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
            console.log('GeoJson :>> ', GeoJson);
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

    /*  Dashboard */
    const [visibleDashboard, setVisibleDashboard] = useState(false);

    /*  Search */
    const [visibleSearch, setVisibleSearch] = useState(false);

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
    const clickLine = () => {
        google.maps.event.clearListeners(map, 'click');
        let count = 0 //นับจำนวนครั้งที่กด วัดระยะ ถ้ากด3ครั้งให้ยกเลิกเมพใหม่
        let origin //จุดมาร์คที่ 1
        let destination //จุดมาร์คที่ 2
        let path
        let markers = []

        let poly = new google.maps.Polyline({
            strokeColor: "#000000",
            strokeOpacity: 1.0,
            strokeWeight: 3,
        });
        poly.setMap(map);
        setOpenLine(!openLine) // สลับปุ่มเปิดปิด
        if (openLine) {
            map.addListener("click", async (event) => {
                if (count < 2) {
                    count++
                    const marker = new google.maps.Marker({
                        position: event.latLng,
                        map: map
                    })
                    markers.push(marker)
                    path = poly.getPath();
                    path.push(event.latLng);
                    if (count === 1) {
                        origin = event.latLng
                    }
                    if (count === 2) {
                        destination = event.latLng
                        const service = new google.maps.DistanceMatrixService();
                        const request = {
                            origins: [origin],
                            destinations: [destination],
                            travelMode: google.maps.TravelMode.DRIVING,
                            unitSystem: google.maps.UnitSystem.METRIC,
                            avoidHighways: false,
                            avoidTolls: false,
                        };
                        const test = await service.getDistanceMatrix(request)
                        if (test.rows[0].elements[0].distance !== undefined) {
                            let infoWindow = await new google.maps.InfoWindow({
                                content: `ระยะทาง${test.rows[0].elements[0].distance.text}`,
                                position: destination,
                            })
                            infoWindow.open(map)
                        }
                    }
                } else {
                    for (let i = 0; i < markers.length; i++) {
                        markers[i].setMap(null);
                        path.pop()
                    }
                    markers = []
                    count = 0
                }
            })
        } else {
            google.maps.event.clearListeners(map, 'click');
            clickMapShowLatLag(map)
        }
    }
    /* เคลียเมพ */
    const clickClearMap = () => {
        var clearMap = new google.maps.Map(googlemap.current, {
            mapTypeControl: false,
            fullscreenControl: false,
            center: centerMap,
            zoom: 8,
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
                center: centerMap,
            };

            // instantiate the map on the left with control positioning
            mapLeft = await new google.maps.Map(googlemapLeft.current, {
                ...mapOptions,
                mapTypeId: "satellite",
                tilt: 0,
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
        }
    }
    /* change map */
    const [imgChangeMap, setImgChangeMap] = useState("https://images.adsttc.com/media/images/6141/d09d/f91c/8104/f800/009b/large_jpg/Feature_Image.jpg?1631703175")
    const [txtChangeMap, setTextChangeMap] = useState("Satellite")
    const [changeMapButtom, setChangeMapButtom] = useState(false)

    const clickChangeMap = () => {
        $("#changeMap").fadeToggle()
        setChangeMapButtom(!changeMapButtom)
        if (!changeMapButtom) {
            map.setMapTypeId(google.maps.MapTypeId.HYBRID)
            setTextChangeMap("Layers")
            setImgChangeMap("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwyYk7BSUClNOfiGhMybXiO4KbV0xOI8nOg_Qy9T9quhUOT4fNB8ZcUrcTPinYtaEsLFU&usqp=CAU")
        } else {
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
            setTextChangeMap("satellite")
            setImgChangeMap("https://images.adsttc.com/media/images/6141/d09d/f91c/8104/f800/009b/large_jpg/Feature_Image.jpg?1631703175")
        }
    }
    const changeMap = (info) => {
        switch (info) {
            case "Terrain":
                map.setMapTypeId("terrain");
                break;
            case "Traffic":
                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);
                break
            case "Transit":
                const transitLayer = new google.maps.TransitLayer();
                transitLayer.setMap(map)
                break
            default:
                break;
        }
    }

    /* วัดขนาดพื่นที่ */
    const areaDistance = () => {
        const drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.CIRCLE,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.POLYLINE,
                    google.maps.drawing.OverlayType.RECTANGLE,
                ],
            }
        });
        // google.maps.event.addListener(drawingManager, 'circlecomplete', function (circle) {
        //     var radius = circle.getRadius();
        //     alert(radius)
        //     console.log(circle)
        // });
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            if (event.type == 'circle') {
                var radius = event.overlay.getRadius();
                // alert(radius)
                // console.log(radius)
                console.log(event.type)
            }
            if (event.type == 'polygon') {
                console.log(event.overlay.latLngs)
            }

            if (event.type == 'polyline') {
                alert("polyline")
            }
            if (event.type == 'rectangle') {
                alert("rectangle")
            }
            console.log(event.type)
        });

        drawingManager.setMap(map);
    }
    /* -------------------------------------------------------------------------------------- */

    /* Search */
    const [formSearch] = Form.useForm();
    const [searchList, setSearchList] = useState([])
    const [layerSearchData, setLayerSearchData] = useState([])
    const [sumData, setSumData] = useState(10)
    const [amount, setAmount] = useState(0)
    const [searchAllList, setSearchAllList] = useState([])

    const onFinishSearch = (value) => {
        apiSearchData({})
    }

    const onFinishFailedSearch = (error) => {
        console.log('error :>> ', error);
    }

    const apiSearchData = async ({ }) => {
        try {
            const { data } = await API.get(`/shp/getSearchData?`)
            const _arr = []
            setAmount(data.items.amount_data)
            setSumData(10)
            data.items.data.forEach((e, i) => {
                e.index = i + 1;
                if (e.color) {
                    const rgb = JSON.parse(e.color)
                    e.color = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
                }
                if (i < 10) _arr.push(e)
            })
            setSearchList(_arr)
            setSearchAllList(data.items.data)

        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const switchGeom = async (value, item) => {
        // console.log('value :>> ', value);
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


    /* Dashboard */
    const [formDashboard] = Form.useForm();

    const onFinishDashboard = (value) => {
        console.log('value :>> ', value);
    }

    const onFinishFailedDashboard = (error) => {
        console.log('error :>> ', error);
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
    const [wmsopacity, setWmsopacity] = useState(100);

    const Clickwms = (items) => {
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
        console.log('maptype :>> ', maptype);
        if (selectwms.some((item) => item.name == maptype.name)) {
            let cut = selectwms.filter((item) => item.name !== maptype.name)
            setSelectwms(cut);
            maptype.removeFromMap(map);
        } else {
            setSelectwms([...selectwms, maptype]);
            maptype.addToMap(map);
            // maptype.zoomToWms(map);
        }
    }
    const ChangeOpacity = (e) => {
        setWmsopacity(e);
    }
    useEffect(() => {
        selectwms.forEach((wms) => {
            wms.setOpacity(wmsopacity / 100);
        })
    }, [wmsopacity]);

    return (
        <Layout isMap={true}>
            <Head>
                <title>PTT Land Map</title>
            </Head>
            <Timeslide onClose={() => setSlidemapshow(false)} visible={slidemapshow} />
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

            <div className="tools-map-cog" onClick={() => openCloseRaster()}>
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
                            onClick={() => {
                                // apiSearchData({})
                                setVisibleSearch(true)
                            }}
                        >
                            <img width="100%" src="/assets/images/search.png" />
                        </button>
                    </Col>
                ) : null}

                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={clickHome} >
                        <img
                            width="100%"
                            src="/assets/images/home.png"
                            title="้home"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={clickLine} >
                        <img
                            width="100%"
                            src="/assets/images/Line.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={clickSplit}>
                        <img
                            width="100%"
                            src="/assets/images/-line_icon.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={areaDistance}>
                        <img
                            width="100%"
                            src="/assets/images/polegon.png"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={ontimeslider} >
                        <img
                            width="100%"
                            src="/assets/images/arrow_back_time.png"
                            title="timeslide"
                        />
                    </button>
                </Col>
                <Col span={6} className="pt-2">
                    <button className="btn btn-light btn-sm" onClick={clickClearMap} >
                        <img
                            width="100%"
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
                            width="100%"
                            src="/assets/images/close_full_screen.png"
                        />
                    </button>
                    <button
                        className="btn btn-light btn-sm"
                        id="openFullscreen"
                        style={{ display: "none" }}
                        onClick={() => openFullscreen()}
                    >
                        <img width="100%" src="/assets/images/open_full_screen.png" />
                    </button>
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
                </Col>
            </div>
            <div className="tools-map-area3" >
                <button className="btn btn-light" onClick={() => clickChangeMap()}>
                    <img width="90" height="90" style={{ borderRadius: "10px" }} src={imgChangeMap} alt="" />
                    <span style={{ position: "absolute", bottom: "15px", left: "25px", textAlign: "center" }}>
                        {txtChangeMap}
                    </span>
                </button>
                <div id="changeMap" style={{ display: "none" }}>
                    <span style={{ display: "flex", justifyContent: "space-around" }} >
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm" onClick={() => changeMap("Terrain")}>
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Terrain.png" alt="" />
                            </button>
                            <h5 className="text-info" >Terrain</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm" onClick={() => changeMap("Traffic")}>
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Traffic.png" alt="" />
                            </button>
                            <h5 className="text-info" >Traffic</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm" onClick={() => changeMap("Transit")}>
                                <img width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Transit.png" alt="" />
                            </button>
                            <h5 className="text-info" >Transit</h5>
                        </span>
                    </span>
                </div>

            </div>

            <div id="map" ref={googlemap} hidden={changmap} />

            <div id="container" hidden={!changmap}>
                <div id="left">
                    <div id="map-left" className="map" ref={googlemapLeft}></div>
                </div>
                <div id="right">
                    <div id="map-right" className="map" ref={googlemapRight}></div>
                </div>
            </div>
            {/* Shape File */}
            <Drawer
                width={350}
                placement={"left"}
                visible={visibleShapeFile}
                onClose={() => setVisibleShapeFile(false)}
            >
                <Tabs>
                    <TabPane tab="ชั้นข้อมูล" key="1">
                        {groupLayerList.map((e, i) =>
                            Object.assign(
                                <div className="pt-2">
                                    <Collapse
                                        expandIcon={({ isActive }) => e.symbol ? <img src={e.symbol} width={20} /> : <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                    >
                                        <Panel header={e.group_name} key={i}>
                                            {e.children
                                                ? e.children.map((x, index) =>
                                                    Object.assign(
                                                        <div className="pt-2" key={index}>
                                                            <Row>
                                                                <Col xs={20}>
                                                                    {/* <Checkbox
                                                                        checked={x.checked}
                                                                        onClick={(value) =>
                                                                            checkboxLayer(value.target.checked, i, index)
                                                                        }
                                                                    >
                                                                        {x.name_layer}
                                                                    </Checkbox> */}
                                                                    <Switch size="small" checked={x.checked} onChange={(value) => checkboxLayer(value, i, index)} /> {x.name_layer}
                                                                </Col>

                                                                <Col xs={4} style={{ paddingTop: 3 }}>
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
                id="drawer-dashboard"
                width={650}
                title="Process ส่งมอบโครงการ"
                placement={"left"}
                visible={visibleDashboard}
                onClose={() => setVisibleDashboard(false)}
            >
                <>
                    <div>
                        <Form
                            form={formDashboard}
                            onFinish={onFinishDashboard}
                            onFinishFailed={onFinishFailedDashboard}
                            layout="vertical"
                            autoComplete="off"
                        >
                            <div className="row">
                                <div className="col-4">
                                    <Form.Item
                                        label=""
                                        name="name_layer"
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
                                            <Option value="partype">เลขที่โฉนด</Option>
                                            <Option value="">ลำดับแปลงที่ดิน</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-3">
                                    <Form.Item
                                        label=""
                                        name="layer"
                                    >
                                        <Select
                                            placeholder="ชั้นข้อมูล"
                                            allowClear
                                        >
                                            {layerList.map(e => <Option value={e.id}>{e.name_layer}</Option>)}
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
                                            {provinceList.map(e => <Option value={e.name}>{e.name}</Option>)}
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
                                            {districtList.map(e => <Option value={e.name}>{e.name}</Option>)}
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
                                        >
                                            {subDistrictList.map(e => <Option value={e.name}>{e.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>


                        </Form>
                    </div>
                    <hr />

                    <h3>แปลง</h3>
                    <div className="row">
                        <div className="col-9">
                            <Doughnut
                                data={{
                                    labels: ['Status1', 'Status2', 'Status3', 'Status4', 'Status5'],
                                    datasets: [
                                        {
                                            label: 'Dataset 1',
                                            data: [5, 20, 300, 45, 2],
                                            backgroundColor: [
                                                'Red',
                                                'Orange',
                                                'Yellow',
                                                'Green',
                                                'Blue',
                                            ],
                                        }
                                    ]
                                }}
                                options={option}
                            />
                        </div>
                        <div className="col-3">
                            <p>Status1 : 5 แปลง</p>
                            <p>Status2 : 20 แปลง</p>
                            <p>Status3 : 300 แปลง</p>
                            <p>Status4 : 45 แปลง</p>
                            <p>Status5 : 2 แปลง</p>
                        </div>
                    </div>

                    <hr />

                    <h3>ระยะทาง</h3>
                    <div className="row">
                        <div className="col-9">
                            <Doughnut
                                data={{
                                    labels: ['Status1', 'Status2', 'Status3', 'Status4', 'Status5'],
                                    datasets: [
                                        {
                                            label: 'Dataset 1',
                                            data: [3, 86, 109, 65, 0.5],
                                            backgroundColor: [
                                                'Red',
                                                'Orange',
                                                'Yellow',
                                                'Green',
                                                'Blue',
                                            ],
                                        }
                                    ]
                                }}
                                options={option}
                            />
                        </div>
                        <div className="col-3">
                            <p>Status1 : 3 ก.ม.</p>
                            <p>Status2 : 86 ก.ม.</p>
                            <p>Status3 : 109 ก.ม.</p>
                            <p>Status4 : 65 ก.ม.</p>
                            <p>Status5 : 0.5 ก.ม.</p>
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
                onClose={() => setVisibleSearch(false)}
            >
                <div>
                    <Form
                        form={formSearch}
                        onFinish={onFinishSearch}
                        onFinishFailed={onFinishFailedSearch}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <div className="row">
                            <div className="col-4">
                                <Form.Item
                                    label=""
                                    name="name_layer"
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
                                    name="layer"
                                >
                                    <Select
                                        placeholder="ชั้นข้อมูล"
                                        allowClear
                                    >
                                        {layerList.map(e => <Option value={e.id}>{e.name_layer}</Option>)}
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
                                        {provinceList.map(e => <Option value={e.name}>{e.name}</Option>)}
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
                                        {districtList.map(e => <Option value={e.name}>{e.name}</Option>)}
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
                                    >
                                        {subDistrictList.map(e => <Option value={e.name}>{e.name}</Option>)}
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
                                                    <button className="btn"><EditFilled /></button>
                                                    <Switch size="small" checked={e.checked} onChange={(value) => switchGeom(value, e)} />
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

            <Drawer placement="right" onClose={() => openCloseRaster()} visible={visibleRaster} width={350}>
                <Tabs defaultActiveKey="1" style={{ marginBottom: "100px" }}>
                    <TabPane tab="Left Layer WMS" key="1">
                        <b className="text-info" >ภาพถ่ายทางอากาศ </b>
                        <Row className="pt-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDron1.slice(0, loadmore1.dronMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwms.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => Clickwms(data)}
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
                                            onClick={() => Clickwms(data)}
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
                        <div style={{ position: "absolute", bottom: "10px", height: "70px", width: "300px", backgroundColor: "#f1eded", padding: "5px" }}>
                            <span><b>Brightness</b></span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
                                <span>🌘</span>
                                <Slider onChange={ChangeOpacity} defaultValue={100} disabled={false} style={{ width: "80%" }} />
                                <span>🌕</span>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="Right Layer WMS" key="2">
                        <b className="text-info" >ภาพถ่ายทางอากาศ </b>
                        <Row className="pt-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDron1.slice(0, loadmore2.dronMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwms.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => Clickwms(data)}
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
                                rasterDataDron1.length > 3 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDron.dron2} onClick={() => { setLoadmore2({ ...loadmore2, dronMore: rasterDataDow1.length }), setShowMoreDron({ ...showMoreDron, dron2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <b className="text-info pt-5">ภาพถ่ายดาวเทียม</b>
                        <Row className="pt-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                rasterDataDow1.slice(0, loadmore2.dowMore).map((data, index) => {
                                    return <Col span={8} key={index} >
                                        <Card
                                            className={`${selectwms.some((item) => item.name == data.id) ? "cardwa" : ""}`}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            onClick={() => Clickwms(data)}
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
                                    <h5 style={{ cursor: "pointer", marginLeft: "220px" }} className="text-info" hidden={showMoreDow.dow2} onClick={() => { setLoadmore2({ ...loadmore2, dowMore: rasterDataDow1.length }), setShowMoreDow({ ...showMoreDow, dow2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <div style={{ position: "absolute", bottom: "10px", height: "70px", width: "300px", backgroundColor: "#f1eded", padding: "5px" }}>
                            <span><b>Brightness</b></span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "baseline" }}>
                                <span>🌘</span>
                                <Slider defaultValue={100} disabled={false} style={{ width: "80%" }} />
                                <span>🌕</span>
                            </div>
                        </div>
                    </TabPane>

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
        </Layout>
    );
};

export default mapPage;
