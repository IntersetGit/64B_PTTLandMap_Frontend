import Layout from "../components/_App/Layout";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Doughnut } from "react-chartjs-2";
import getTextThaiObjShape from '../util/GetTextThaiObjShape'
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
    Tooltip,
    InputNumber,
    Table,
    Pagination,
    Radio,
    Spin,
    Space,
    Image
} from "antd";
import Head from "next/head";
import { useSelector } from "react-redux";
import { SketchPicker } from "react-color";
import { CaretRightOutlined, UploadOutlined, EditFilled, ExpandOutlined, EyeFilled, UnorderedListOutlined, TableOutlined, CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import API from "../util/Api";
import RefreshToken from "../util/RefreshToken";
import axios from "axios";
import { Cookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import Timeslide from "../components/Timeslider";
import Color from '../components/Color';
import ShapeText from "../util/obj/ShapeText";
import ShapeShow from "../util/obj/ShapeShow";

const cookies = new Cookies();

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Meta } = Card;
const { size } = useState;

const { Option } = Select;
const mapPage = () => {
    const [map, setMap] = useState(null);
    const [mapLeft, setMapLeft] = useState(null);
    const [mapRight, setMapRight] = useState(null);
    const googlemap = useRef(null);
    const { user } = useSelector(({ user }) => user);
    const centerMap = { lat: 13.78, lng: 100.55 }
    const [layerData, setLayerData] = useState([])
    const [containerFluidMap, setContainerFluidMap] = useState(60)
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [events, setEvents] = useState([
        "load",
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress"])

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
            libraries: ["drawing", "places", "geometry", "weekly"],
        });
        loader.load().then(() => {
            const google = window.google;
            var _map = new google.maps.Map(googlemap.current, {
                mapTypeControl: false,
                fullscreenControl: false,
                center: centerMap,
                zoom: 8,
                scaleControl: true
            });
            setMap(_map);
            google.maps.event.addListener(_map, "mousemove", (event) => {
                getLatLon(event);
            });
            clickMapShowLatLag(_map)


        });
        loadShapeFile()
        loadGetShapeProvince()


        getMasStatusProject()

    }, []);
    useEffect(() => {
        GetStreetView()
    }, [map]);

    useEffect(() => {
        for (var i in events) {/*ตรวจจับทุกอีเวน์ในการเคลื่อนไหว*/
            window.addEventListener(events[i], () => {
                const { innerWidth: width, innerHeight: height } = window;
                // console.log('width :>> ', width);
                // console.log('height :>> ', height);
                setWidth(width)
                setHeight(height)
            });
        }

    }, [])


    const ClickMapshowFeatureWms = (_map) => {
        const infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(_map, 'click', async (e) => {
            await getfeature(e, _map, infowindow)
        });
    }
    const getfeature = async (event, map, infowindow) => {
        let contentAll = ``
        let stat = [];
        setListWms((e) => {
            stat = e;
            return e
        });
        for (const maptype of stat) {
            let result = await maptype.GetfeatureData(event, map);
            if (result) {

                contentAll += `<br>` + result

            }
        }
        var parser = new DOMParser();
        var doc = parser.parseFromString(contentAll, 'text/html');
        let h5 = doc.querySelectorAll('h5');
        if (h5.length) {
            Array.from(h5).forEach((h) => {
                h.style.fontSize = "80%";
            })
        }
        let html = doc.querySelector("html")
        infowindow.close()
        infowindow.setContent(`${html.outerHTML}`);
        infowindow.setPosition(event.latLng);
        if (contentAll !== ``) {
            infowindow.open(map)
        }
    }
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
    const [FileListSymbol, setFileListSymbol] = useState([]);
    const [FileUpload, setFileUpload] = useState(null);
    const [FileUploadSymbol, setFileUploadSymbol] = useState(null);
    const [FileType, setFileType] = useState(null);
    const [openColorUpload, setOpenColorUpload] = useState(false);
    const [listWms, setListWms] = useState([])
    const [colorUpload, setColorUpload] = useState({
        hex: "red",
        rgb: { r: 255, g: 0, b: 0, a: 1 },
    });
    const [colorFrame, setColorFrame] = useState({
        hex: "#000000",
        rgb: { r: 0, g: 0, b: 0, a: 1 },
    });
    const [inputValueOpacityColor, setInputValueOpacityColor] = useState(0.5) //Opacity
    const [inputValueStrokColor, setInputValueStrokColor] = useState(1) //ความหนากรอบ


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
                        // const nameType =
                        //     type == "zip" ? "shape file" : type;
                        // setFileType(nameType);
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
            // setFileType(null);
        }
    };

    const handleChangeSymbol = (info) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);
        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") fileList = fileList.map((file) => file);
        }
        setFileListSymbol(fileList);
        if (fileList.length > 0) setFileUploadSymbol(fileList[0]);
        else setFileUploadSymbol(null);
    };

    const onFinishUpload = async (value) => {
        try {
            console.log('value :>> ', value);
            // console.log('FileType :>> ', FileType);
            // console.log('colorUpload :>> ', colorUpload.hex);
            let Symbol = {};
            if (FileType === "Point") {
                if (FileUploadSymbol) {
                    const formDataSymbol = new FormData();
                    formDataSymbol.append("file0", FileUploadSymbol.originFileObj);
                    const token = cookies.get("token");
                    const { data } = await axios({
                        method: "post",
                        url: `${process.env.NEXT_PUBLIC_SERVICE}/upload?Path=symbol_point&Length=1`,
                        config: { headers: { "Content-Type": "multipart/form-data" } },
                        headers: { Authorization: "Bearer " + token },
                        data: formDataSymbol,
                    });
                    Symbol = data.items[0]
                } else {
                    if (nameImgDefault === null) {
                        message.error("กรุณาเลือก Symbol!");
                        return false
                    }
                    const data = await API.post(`${process.env.NEXT_PUBLIC_SERVICE}/upload/uploadPointDefault`, { img: nameImgDefault })
                    Symbol = data.data.items
                }
            }

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

                    const option_layer = {
                        fillOpacity: inputValueOpacityColor,
                        strokeWeight: inputValueStrokColor,
                        strokeColor: colorFrame,
                        symbol: Symbol ?? {},
                    }
                    const config_typoint = {
                        canvasType: textImgDefault
                    }
                    formData.append("option_layer", JSON.stringify(option_layer));
                    // formData.append("config_typoint", JSON.stringify(config_typoint));
                    await axios({
                        method: "post",
                        url: `${process.env.NEXT_PUBLIC_SERVICE}/shp/add?name_layer=${name_layer}&type=${FileType}&group_layer_id=${group_layer_id}&color=${JSON.stringify(colorUpload.rgb)}`,
                        config: { headers: { "Content-Type": "multipart/form-data" } },
                        headers: { Authorization: "Bearer " + token },
                        data: formData,
                        Symbol
                    });
                    await loadShapeFile();
                    setFileList([]);
                    setFileListSymbol(null)
                    setFileUpload(null);
                    setFileType(null);
                    setOpenColorUpload(false);
                    setNameImgDefault(null)
                    setTextImgDefault(null)
                    setColorUpload({
                        hex: "red",
                        rgb: { r: 255, g: 0, b: 0, a: 1 },
                    });
                    formUpload.resetFields();
                    $(".uploadUser").toggle()
                    $(".defaultPoint").toggle()
                    setRadioPoint("กำหนดเอง")
                    message.success("บันทึกสำเร็จ");
                }
            } else {
                message.error("กรุณาเลือกไฟล์!");
            }
        } catch (error) {
            // message.error("มีบางอย่างผิดพลาด !");
        }
    };

    const callbackActionUpload = async (value) => {
        try {
            const formData = new FormData();
            formData.append("file", value);
            const token = cookies.get("token");
            const { data } = await axios({
                method: "post",
                url: `${process.env.NEXT_PUBLIC_SERVICE}/shp/checkUploadFile`,
                config: { headers: { "Content-Type": "multipart/form-data" } },
                headers: { Authorization: "Bearer " + token },
                data: formData,
            });
            // console.log('data :>> ', data.items.type);
            setFileType(data.items.type);
            return `${process.env.NEXT_PUBLIC_SERVICE}/demo/resTrue`
        } catch (error) {
            message.error(
                error.response.data || error.response.status == 400 ? error.response.data.error.message : "มีบางอย่างผิดพลาด !"
            );

            return `${process.env.NEXT_PUBLIC_SERVICE}/demo/resFalse`
        }
    }

    const onFinishFailedUpload = (error) => {
        // message.error("มีบางอย่างผิดพลาด !");
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
                        } else {
                            x.color_layer = colorUpload.rgb
                            x.rgb = colorUpload
                        }
                    });
                } else e.children = []
            });
            console.log('data :>> ', data.items);
            setGroupLayerList(data.items)

            /* layerList */
            const find = data.items.find(e => e.id === "f942a946-3bcb-4062-9207-d78ab437edf3")
            if (find) setLayerList(find.children)

        } catch (error) {
            // message.error("มีบางอย่างผิดพลาด !");
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
        changeColor(arr[index1].children[index2].id, arr[index1].children[index2].color_layer, arr[index1].children[index2].option_layer)

    };

    const checkboxLayer = async (value, index1, index2) => {
        const arr = [...groupLayerList]
        arr[index1].children[index2].checked = value

        if (arr[index1].children[index2].type == "wms") {
            const setwms = []
            const items = arr[index1].children[index2]
            // console.log('items :>> ', items);
            // "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/"
            let maptype = new WmsMapType(
                items.id,
                items.url, {
                layers: items.layer_name,
                wmsProjectKey: items.id,
                type: items.type_server
            }, {
                opacity: 100 / 100
            }, items.type_server
            );
            // console.log('maptype :>> ', maptype);

            if (listWms.some((item) => item.name == maptype.name)) {
                let cut = listWms.filter((item) => item.name !== maptype.name)
                setListWms(cut);
                maptype.removeFromMap(map);

            } else {
                setListWms([...listWms, maptype]);
                maptype.addToMap(map);
                setwms.push(maptype);


            }

            // listWms, setListWms

        } else {
            if (!value) {
                arr[index1].children[index2].checked = value
                clearMapData(arr[index1].children[index2].id)
            } else {
                const item = arr[index1].children[index2];
                console.log('item :>> ', item);
                await getDeoJson(item.id, item.color_layer, item.option_layer, item.config_typoint)
            }
            setGroupLayerList(arr)
        }

    };


    const changeColor = (id, color, option_layer) => {
        const arr = [...layerData]
        const index = arr.findIndex(e => e.id == id)
        if (index != -1) {
            const layer = arr[index].layer
            // layer.setStyle({
            //     fillColor: color,
            //     fillOpacity: 0.5,
            //     strokeWeight: 1,
            //     clickable: false
            // });
            option_layer = option_layer ?? {}
            layer.setStyle((e) => {
                return {
                    fillColor: e.h.status_color ?? color,
                    fillOpacity: option_layer.fillOpacity ?? inputValueOpacityColor, //Opacity
                    strokeWeight: option_layer.strokeWeight ?? inputValueStrokColor,  //ความหนาขอบ
                    strokeColor: option_layer.strokeColor ? option_layer.strokeColor.hex : colorFrame.hex, //เส้นขอบ
                    // clickable: false,
                }
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

    const getDeoJson = async (id, color, option_layer, config_typoint) => {
        // google.maps.event.clearListeners(map, 'click');

        try {
            const { data } = await API.get(`/shp/shapeData?id=${id}`);
            const GeoJson = data.items.shape;
            const bounds = new google.maps.LatLngBounds();
            const layer = new google.maps.Data();
            layer.addGeoJson(GeoJson)
            option_layer = option_layer ?? {}
            let icon = null
            if (option_layer.symbol) {
                let width = 20, height = 20
                icon = {
                    url: option_layer.symbol.location,
                    scaledSize: new google.maps.Size(width, height), // scaled size
                    // origin: new google.maps.Point(0, 0), // origin
                    anchor: new google.maps.Point(10, 10) // anchor
                }
            }
            // createMarker(config_typoint && config_typoint.canvasType, option_layer.fillOpacity, option_layer.strokeColor, option_layer.strokeWeight),
            console.log('option_layer :>> ', option_layer);
            layer.setStyle((e) => {
                return {
                    fillColor: e.h.status_color ?? color,
                    fillOpacity: option_layer.fillOpacity ?? inputValueOpacityColor, //Opacity
                    strokeWeight: option_layer.strokeWeight ?? inputValueStrokColor,  //ความหนาขอบ
                    strokeColor: option_layer.strokeColor ? option_layer.strokeColor.hex : colorFrame.hex, //เส้นขอบ
                    icon

                }
            });


            layer.setMap(map);
            layer.addListener('click', (e) => {
                setInfoWindowWA(e);
            })

            layer.forEach((feature) => {
                // console.log('feature :>> ', feature);
                feature.getGeometry().forEachLatLng((latlng) => {
                    bounds.extend(latlng);
                });
            });

            setLayerData([...layerData, { id, layer }])
            map.fitBounds(bounds);

        } catch (error) {
            console.log('errr :>> ', error);
        }
    };

    const [infoWindowMap, setInfoWindowMap] = useState([])
    const setInfoWindowWA = (feature) => {

        // let key = Object.keys(feature.feature.h);
        // let content = "<div id='infoBox'><center><strong>รายละเอียดข้อมูล</strong></center><br />";
        // key.forEach((a, i) => {
        //     // console.log('a :>> ', a);
        //     content += a + ": " + feature.feature.h[a] + "<br />";
        // });
        // content += "</div>";
        const item = feature.feature.j;

        window.clickEdit = () => {
            setModeInfoSearch("edit")
            editShapefileSearch(item)
        }
        window.clickView = () => {
            setModeInfoSearch("view")
            editShapefileSearch(item)
        }

        // console.log('item -----------------:>> ', item);

        let content = `
        <div id='infoBox'><center><strong>${item.group_layer_id === 'f942a946-3bcb-4062-9207-d78ab437edf3' ? `แปลงที่ดินลำดับที่ ${item.parid ?? '-'}` : 'รายละเอียดข้อมูล'}</strong></center><br />
        <table style="width: 350px;" class="table table-striped"> `

        if (item.from_model) {
            const key = Object.keys(item);
            const formList = []
            key.forEach((a, i) => {
                // a + ": " + item[a] + "<br />";
                const _find = ShapeText.find(where => where.key == a)

                if (_find && _find.is_show_plot && _find.sort_plot) {
                    formList.push({
                        index: _find.sort_plot,
                        text: getTextThaiObjShape(a),
                        value: item[a] ?? "",
                    })
                }
            });
            formList.sort((a, b) => a.index - b.index);
            formList.forEach(e => {
                if (e.text.toLowerCase() == 'link'.toLowerCase()) {
                    content += `
                        <tr>
                        <td>${e.text}</td> `
                    if (e.value) content += ` <td><a href="${e.value}" target="_blank" >${e.value}</a></td>`
                    else content += ` <td>-</td>`
                    content += `
                        </tr>`
                } else {
                    content += `
                    <tr>
                        <td>${e.text}</td>
                        <td>${e.value}</td>
                    </tr>`
                }
            });


        } else {
            const key = Object.keys(item);
            key.forEach((a, i) => {
                if (item[a] !== null && a != "from_model" && a != "gid" && a != "group_layer_id" && a != "table_name" && a != "status_color" || a == 'link') {
                    // a + ": " + item[a] + "<br />";
                    if (a == 'link') {
                        content += `
                        <tr>
                            <td>${a}</td> `
                        if (!item[a]) content += ` <td>-</td> `
                        else content += ` <td><a href="${item[a]}" target="_blank" >${item[a]}</a></td> `
                        content += ` </tr> `
                    } else {
                        content += `
                        <tr>
                            <td>${a}</td>
                            <td>${item[a] ?? ''}</td>
                        </tr>`
                    }
                }
            });
        }


        content += `
        </table>
        <div style="text-align: end;">
        ${(item.from_model && user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ? `
        <a style="cursor: pointer;" onclick="clickEdit()"><img style="width: 25px;" src="${process.env.NEXT_PUBLIC_SERVICE}/icon/icon-edit.png"></a>` :
                `<a style="cursor: pointer;" onclick="clickView()"><img style="width: 25px;" src="${process.env.NEXT_PUBLIC_SERVICE}/icon/icon-view.png"></a>`}
        </div>`


        // if (item.from_model) delete item.from_model
        // if (item.group_layer_id) delete item.group_layer_id

        const infowindow = new google.maps.InfoWindow({
            id: item.gid,
            content
        });
        const arr = infoWindowMap
        infoWindowMap.forEach(j => j.close());
        arr.push(infowindow)
        setInfoWindowMap(arr)


        infowindow.setContent(content);
        infowindow.setPosition(feature.latLng);
        infowindow.open(map);

    }



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
            // message.error("มีบางอย่างผิดพลาด !");
        }
    };

    /*------------------------------------------------------------------------------ */
    /* Raster */
    const [visibleRaster, setVisibleRaster] = useState(false)
    const [rasterDataDron1, setRasterDataDron1] = useState([]) // ข้อมูล raster ภาพถ่ายจากดาวเทียม
    const [rasterDataDow1, setRasterDataDow1] = useState([]) // ข้อมูล raster ภาพถ่ายทางอากาศจากโดรน
    const [loadmore1, setLoadmore1] = useState({ dronMore: 6, dowMore: 6 })
    const [loadmore2, setLoadmore2] = useState({ dronMore: 6, dowMore: 6 })
    /* แสดง Loadmore ข้อมูลเพิ่มเตืม */
    const [showMoreDow, setShowMoreDow] = useState({ dow1: false, dow2: false }) //โชวLoadmore  ภาพถ่ายจากดาวเทียม
    const [showMoreDron, setShowMoreDron] = useState({ dron1: false, dron2: false }) //โชวLoadmore  ภาพถ่ายทางอากาศจากโดรน
    const openCloseRaster = async () => {
        let dron = []; //ภาพถ่ายทางอากาศจากโดรน
        let dow = []; //ภาพถ่ายจากดาวเทียม
        setVisibleRaster(!visibleRaster)
        if (!visibleRaster) {
            const respRaster = await API.get("/masterdata/datLayers")
            // console.log(respRaster)
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
        setContainerFluidMap(!hideNavbar ? 0 : 60)
        setHideNavbar(!hideNavbar)
    };
    const menuOpenFullscreen = () => {
        $("#openFullscreen").fadeToggle();
        $("#closeFullscreen").fadeToggle("slow");
    };

    const clickMapShowLatLag = (map) => {
        let test = new google.maps.InfoWindow()
        test.open(map);
        google.maps.event.addListener(map, "rightclick", (event) => {
            test.close()
            test = new google.maps.InfoWindow({
                content: `${event.latLng}`,
                position: event.latLng,
            })
            test.open(map)
        })

        ClickMapshowFeatureWms(map)
    }
    /* เปิดปิดเส้นวัดระยะ */
    const [openLine, setOpenLine] = useState(true) //ปุ่มเปิดปิด Line
    const [poly, setPoly] = useState(null);
    const [distanct, setDistanct] = useState(null);
    const [distanceTest, setDistanceTest] = useState(null)
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
                // {
                //     icon: {
                //         path: "M 0,-1 0,1",
                //         strokeOpacity: 1,
                //         scale: 2,
                //         rotation: 90,

                //     },
                //     offset: "10%",
                //     repeat: "20px",
                // },
                {
                    icon: symbolOne,
                    offset: "100%",
                },
            ],
        });
        setPoly(poly);
        var centerLabel = new MapLabel({
            map: map,
            fontSize: 13,
            align: "center",
        });
        setDistanceTest(centerLabel)
    }, []);
    const clickLine = () => {
        setOpenLine(!openLine) // สลับปุ่มเปิดปิด
        google.maps.event.clearListeners(map, 'click');
        var count = 0 //นับจำนวนครั้งที่กด วัดระยะ
        var distance = [] //เก็บ lat lag แต่ละครั้ง
        let path
        let max = [] //รวมระยะทางทั้งหมด
        let sum = null //เก็บผลรวมระยาทาง
        if (openLine) {
            distanceTest.setMap(map)
            //มอบอีเว้นให้สามารถแก้ไขการวาดได้

            google.maps.event.addListener(poly, "dragend", getPath);
            google.maps.event.addListener(poly.getPath(), "insert_at", getPath);
            google.maps.event.addListener(poly.getPath(), "remove_at", getPath);
            google.maps.event.addListener(poly.getPath(), "set_at", getPath);
            google.maps.event.addListener(poly, 'click', function (e) {
                this.setEditable(true);
            });

            poly.setMap(map);

            function getPath() {
                let path = poly.getPath();
                let len = path.getLength();
                let sumline = [];

                for (var i = 0; i < len; i++) {
                    var one = new google.maps.LatLng(path.getAt(i).lat(), path.getAt(i).lng());
                    var two = new google.maps.LatLng(path.getAt(path.getLength() - 1).lat(), path.getAt(path.getLength() - 1).lng());
                    // console.log(`one`, path.getAt(i).lat(), path.getAt(i).lng())
                    // console.log(`two`, path.getAt(path.getLength() - 1).lat(), path.getAt(path.getLength() - 1).lng())
                    var procressDistance = google.maps.geometry.spherical.computeDistanceBetween(one, two)
                    sumline.push(procressDistance)
                    sum = sumline.reduce((a, b) => a + b, 0)
                    let mToCm = sum / 1000
                    setDistanct(`ระยะทาง${mToCm.toFixed(2)} กม.`);
                    distanceTest.set("position", path.getAt(path.getLength() - 1));
                    distanceTest.set("text", `ระยะทาง${mToCm.toFixed(2)} กม.`);
                }

            }

            map.setOptions({ draggableCursor: 'crosshair' });
            map.addListener("click", async (event) => {
                poly.setEditable(false);

                path = poly.getPath();
                path.push(event.latLng);
                // distance.push(event.latLng.toJSON())
                // if (count > 0) {
                //     var _kCord = new google.maps.LatLng(distance[count - 1].lat, distance[count - 1].lng);
                //     var _pCord = new google.maps.LatLng(distance[count].lat, distance[count].lng);
                //     var procressDistance = google.maps.geometry.spherical.computeDistanceBetween(_kCord, _pCord)
                //     max.push(procressDistance)
                //     sum = max.reduce((a, b) => a + b, 0)
                //     let mToCm = sum / 1000
                //     setDistanct(`ระยะทาง${mToCm.toFixed(2)} กม.`);
                //     distanceTest.set("position", event.latLng);
                //     distanceTest.set("text", `                               ระยะทาง${mToCm.toFixed(2)} กม.`);
                // }
                // count++ //เพิ่มจำนวนครั้งที่กด

            })

        } else {
            let path = poly.getPath();
            path.forEach(i => path.pop())
            distanceTest.set("text", "");
            distanceTest.setMap(null)
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
        clickMapShowLatLag(clearMap)
        setSlidemapshow(false)
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
    const [areadistanemode, setAreadistanemode] = useState(true)
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

        let markerwa1 = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: boundsCenter,
            icon: {
                url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
                scaledSize: new google.maps.Size(80, 80),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(32, 65),
                labelOrigin: new google.maps.Point(40, 33),

            },
            label: {
                text: (parseFloat(area)).toLocaleString('en-US') + " ตร.ม",
                color: "#f17500",
                fontSize: "13px",
                fontWeight: "bold",

            },
            zIndex: 99
        });
        polygon.labels.push(markerwa1);
        if (path.getLength() < 2) return;
        for (var i = 0; i < polygon.getPath().getLength(); i++) {
            // for each side in path, compute center and length
            var start = polygon.getPath().getAt(i);
            var end = polygon.getPath().getAt(i < polygon.getPath().getLength() - 1 ? i + 1 : 0);
            var sideLength = google.maps.geometry.spherical.computeDistanceBetween(start, end);
            var sideCenter = google.maps.geometry.spherical.interpolate(start, end, 0.5);


            let markerwa2 = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.DROP,
                position: sideCenter,
                icon: {
                    url: 'http://image.flaticon.com/icons/svg/252/252025.svg',
                    scaledSize: new google.maps.Size(80, 80),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(32, 65),
                    labelOrigin: new google.maps.Point(40, 33),
                },
                label: {
                    text: (parseFloat(sideLength.toFixed(2))).toLocaleString('en-US') + " ม.",
                    color: "#f17500",
                    fontSize: "13px",
                    fontWeight: "bold"
                },
                zIndex: 99
            });
            polygon.labels.push(markerwa2);

        }
    }
    function removePolygonInfoWindow(labels) {
        for (var i = 0; i < labels.length; i++) {
            labels[i].setMap(null);
        }
        labels = [];
    }
    const areaDistance = () => {
        setAreadistanemode(!areadistanemode)
        deleteAllShape();
        const drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: false,
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            polygonOptions: {
                strokeColor: "#008cff",
                strokeWeight: 1.5,
                fillOpacity: 0.3,
                editable: true,
                draggable: true,
                fillColor: "#008cff",
                zIndex: 0,

            },
            // map: map
        });
        if (areadistanemode) {
            drawingManager.setMap(map);
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
                // drawings.push(e);

                setDrawings([...drawings, e])
                var newShape = e.overlay;
                newShape.type = e.type;
                console.log('newShape :>> ', e);
                if (e.type == 'polygon') {
                    var path = newShape.getPath();

                    console.log('path :>> ', path);
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
                    drawingManager.setDrawingMode(null);
                }
                drawingManager.setDrawingMode(null);
            });
        } else {
            drawingManager.setDrawingMode(null);
            map.setOptions({ draggableCursor: 'default' });

        }

    }
    useEffect(() => {
        $(document).ready(() => {
            $(".NameHighlights").mouseover(() => {
                $(".NameHighlights").addClass("NameHighlightsHover")
            })
            $(".NameHighlights").mouseout(() => {
                $(".NameHighlights").removeClass("NameHighlightsHover")
            })
        })
    }, [])
    const [dowSwipeMap, setDowSwipMap] = useState({ mapLeft: true, mapRight: false })
    const clickdowSwipMap = (type) => {
        if (type === 'left') {
            if (dowSwipeMap.mapLeft) {
                mapLeft.setMapTypeId(google.maps.MapTypeId.ROADMAP)
                setDowSwipMap({ ...dowSwipeMap, mapLeft: false })
            } else {
                mapLeft.setMapTypeId(google.maps.MapTypeId.HYBRID)
                setDowSwipMap({ ...dowSwipeMap, mapLeft: true })

            }
        } else {
            if (dowSwipeMap.mapRight) {
                mapRight.setMapTypeId(google.maps.MapTypeId.ROADMAP)
                setDowSwipMap({ ...dowSwipeMap, mapRight: false })
            } else {
                mapRight.setMapTypeId(google.maps.MapTypeId.HYBRID)
                setDowSwipMap({ ...dowSwipeMap, mapRight: true })
            }

        }
    }

    // select upload image  from user or default
    const [textImgDefault, setTextImgDefault] = useState()
    const [nameImgDefault, setNameImgDefault] = useState(null)
    const [imgpontgen, setImgpontgen] = useState(null);

    // useEffect(() => {
    //     setImgpontgen(createMarker());

    // }, [colorFrame, colorUpload, inputValueStrokColor, inputValueOpacityColor]);


    function createMarker(name = textImgDefault, fillOpacity /* Opacity */, strokeColor /* hex and RGB*/, strokeWeight /*เส้นขอบ*/) {
        let rgbconvert = (rgb, opacity) => {
            return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`
        }

        var canvas, context;
        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");

        if (name == 'circle') {

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radiusc = 60;

            context.beginPath();
            context.arc(centerX, centerY, radiusc, 0, 2 * Math.PI, false);
            context.fillStyle = rgbconvert(colorUpload.rgb ?? strokeColor.rgb, inputValueOpacityColor ?? fillOpacity);
            context.fill();
            context.lineWidth = inputValueStrokColor ?? strokeWeight;
            context.strokeStyle = colorFrame.hex ?? strokeColor.hex;
            context.stroke();

            return canvas.toDataURL();
        }

        if (name == 'square') {

            context.fillStyle = rgbconvert(colorUpload.rgb ?? strokeColor.rgb, inputValueOpacityColor ?? fillOpacity);
            context.fillRect(110, 30, 100, 100);
            context.lineWidth = inputValueStrokColor ?? strokeWeight;
            context.strokeStyle = colorFrame.hex ?? strokeColor.hex;
            context.strokeRect(110, 30, 100, 100);
            context.stroke();
            return canvas.toDataURL();

        }

        if (name == 'triangle') {
            context.beginPath();
            context.moveTo(200, 25);
            context.lineTo(130, 25);
            context.lineTo(165, 90);
            context.closePath();

            // the outline
            context.lineWidth = inputValueStrokColor ?? strokeWeight;
            context.strokeStyle = colorFrame.hex ?? strokeColor.hex;
            context.stroke();

            // the fill color
            context.fillStyle = rgbconvert(colorUpload.rgb ?? strokeColor.rgb, inputValueOpacityColor ?? fillOpacity);
            context.fill();
            return canvas.toDataURL();
        }

    }

    const onSelectImageDefault = (img, classes, name) => {
        $(`.defalutImage`).css("border", "none")
        $(`.${classes}`).css("border", "1px black solid")
        setTextImgDefault(name)
        setNameImgDefault(img)
        // setImgpontgen(createMarker(name))

    }
    const [radioPoint, setRadioPoint] = useState("กำหนดเอง")
    const onChangeDefaultPoint = (e) => {
        $(".uploadUser").toggle()
        $(".defaultPoint").toggle()
        if (e.target.value === 'กำหนดเอง') {
            setNameImgDefault(null)
            $(`.defalutImage`).css("border", "none")
        }
        if (e.target.value === 'Default') {
            setFileUploadSymbol(null)
            setFileListSymbol(null)
            setTextImgDefault(null)
        }
        setRadioPoint(e.target.value)
    }


    //loading search
    const [loadingSearch, setLoadingSearch] = useState(true);
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
    const [placeholderSearch, setPlaceholderSearch] = useState("กรอกหมายเลขแปลง หรือเลขที่เอกสารสิทธิ์")

    /* Detail */
    const [pageDetailSearch, setPageDetailSearch] = useState(1)

    /* table */
    const [modeSearch, setModeSearch] = useState("Detail");
    const [modeInfoSearch, setModeInfoSearch] = useState(null);
    const [pageSearch, setPageSearch] = useState(1)
    const [totalSearch, setTotalSearch] = useState(0)
    const [limitSearch, setLimitSearch] = useState(10)
    const [projectNameListSearch, setProjectNameListSearch] = useState([])
    const [documentNameListSearch, setDocumentNameListSearch] = useState([])

    const columnsSearch = [
        {
            title: 'ลำดับ',
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: 100,
            render: (text, record, index) => {
                index += ((pageSearch - 1) * limitSearch)
                return (index + 1).toLocaleString()
            },
        },
        {
            title: 'OBJECTID',
            dataIndex: 'objectid',
            key: 'objectid',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'Shape',
            dataIndex: 'Shape',
            key: 'Shape',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PARID',
            dataIndex: 'parid',
            key: 'parid',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PARDEEDNO',
            dataIndex: 'PARDEEDNO',
            key: 'PARDEEDNO',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PARLOTNO',
            dataIndex: 'PARLOTNO',
            key: 'PARLOTNO',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PARTYPE',
            dataIndex: 'partype',
            key: 'partype',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'AREARAI',
            dataIndex: 'row_distan',
            key: 'row_distan',
            width: 200,
            align: "center",
            render: (text, record) => text ?? "-",
        },
    ]

    const onFinishSearch = (value) => {
        setLoadingSearch(true)
        apiSearchData({ ...value })
    }

    const onFinishFailedSearch = (error) => {
        console.log('error :>> ', error);
    }

    const apiSearchData = async ({ layer_group = "", project_name = "", select_search = "", document_name = "", prov = "", search = "", tam = "", amp = "" }) => {
        try {
            let url = `/shp/getSearchData?temp=1`
            if (layer_group) url += `&layer_group=${layer_group}`
            if (project_name) url += `&project_name=${project_name}`
            if (select_search) url += `&select_search=${select_search}`
            if (document_name) url += `&document_name=${document_name}`
            if (prov) url += `&prov=${prov}`
            if (search) url += `&search=${search}`
            if (tam) url += `&tam=${tam}`
            if (amp) url += `&amp=${amp}`

            const { data } = await API.get(url)
            // console.log('data :>> ', data.items);
            const _arr = []
            setAmount(data.items.amount_data)
            setSumData(10)
            data.items.data.forEach((e, i) => {
                e.index = i + 1;
                e.status = e.status ? e.status.toString() : null
                // if (e.color) {
                //     const rgb = JSON.parse(e.color)
                //     e.color = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`;
                // }
                if (i < 10) _arr.push(e)
            })
            setSearchList(_arr)
            setLoadingSearch(false)
            setSearchAllList(data.items.data)
            getDataNameProject()

        } catch (error) {
            console.log('error :>> ', error);
            // message.error("มีบางอย่างผิดพลาด !");
        }
    }

    const getDataNameProject = async (layer_group = "") => {
        try {
            let url = `/shp/getDataNameProject?temp=1`
            if (layer_group) url += `&layer_group=${layer_group}`
            const { data } = await API.get(url)
            console.log('data :>> ', data.items);
            const { document_name, project_name } = data.items
            setProjectNameListSearch(project_name)
            setDocumentNameListSearch(document_name)
        } catch (error) {
            // message.error("มีบางอย่างผิดพลาด !");
        }
    }

    const [markerLayer, setMarkerLayer] = useState(null)
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
                console.log('markerLayer :>> ', markerLayer);
            }
        } else {
            const { data } = await API.get(`/shp/getByIdShape?id=${item.gid}&table_name=${item.table_name}`);
            const GeoJson = data.items.shape;
            // console.log('GeoJson :>> ', GeoJson);
            const bounds = new google.maps.LatLngBounds();
            const layer = new google.maps.Data();
            layer.addGeoJson(GeoJson)
            const fillColor = GeoJson ? GeoJson.features[0].properties.status_color : item.color

            layer.addGeoJson(GeoJson)
            // layer.setStyle({
            //     fillColor: item.color,
            //     fillOpacity: 0.5,
            //     strokeWeight: 1,
            //     clickable: false
            // });
            // console.log('item :>> ', item);
            const option_layer = item.option_layer ?? {}
            layer.setStyle({
                fillColor,
                fillOpacity: 1, //Opacity
                strokeWeight: 3,  //ความหนาขอบ
                strokeColor: option_layer.strokeColor ? option_layer.strokeColor.hex : colorFrame.hex, //เส้นขอบ
                // clickable: false,
            });

            layer.setMap(map);

            const layer_arr = []
            layer.forEach((feature) => {
                feature.getGeometry().forEachLatLng((latlng) => {
                    bounds.extend(latlng);
                    const lat = latlng.lat(), lng = latlng.lng();
                    const position = { lat, lng };
                    layer_arr.push(position)
                });
            });
            // console.log('layer_arr :>> ', layer_arr);
            // const markerLayer = new google.maps.Marker({
            //     position: layer_arr[Math.ceil(layer_arr.length / 2)],
            //     map,
            // });

            // setMarkerLayer(markerLayer)

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

    const paginationSearchData = (page, _limit) => {
        const _arr = [...searchAllList]
        const trimStart = (page - 1) * _limit
        const trimEnd = trimStart + _limit
        const trimmedData = _arr.slice(trimStart, trimEnd)
        setSearchList(trimmedData)
        setPageDetailSearch(page)
    }

    const editShapefileSearch = (item, index) => {
        // console.log('item :>> ', item);
        const formData = []
        const setFieldsValue = {}

        delete item.status_color;
        delete item.from_model
        delete item.group_layer_id
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
            console.log('value :>> ', value);
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
            // message.error("มีบางอย่างผิดพลาด !");
        }
    }

    const onFinishFailedModalSearch = (error) => {
        console.log('error :>> ', error);
    }


    /* Dashboard */
    const [visibleDashboard, setVisibleDashboard] = useState(false);
    const [formDashboard] = Form.useForm();
    const [sumDashboard, setSumDashboard] = useState({
        distance: 0,
        plot: 0,
    })

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
            let sum = {
                distance: 0,
                plot: 0,
            }
            const { data } = await API.get(url)
            // console.log('data :>> ', data.items);

            const { plot, distance, status_color } = data.items

            /* plot */
            const _plotDashboard = {
                labels: [],
                datasets: [{
                    label: 'แปลง',
                    data: [],
                    backgroundColor: status_color,
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
                sum.plot += Number(e)
            })

            setPlotDashboard({ ..._plotDashboard })

            /* distance */
            const _distanceDashboard = {
                labels: [],
                datasets: [{
                    label: 'ระยะทาง',
                    data: [],
                    backgroundColor: status_color,
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
                sum.distance += Number(e)
            })
            setSumDashboard({ ...sumDashboard, distance: sum.distance, plot: sum.plot })
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

    //--------------------------------Timeslider-----------------------------------------------------
    const [datatimeslider, setDatatimeslider] = useState([]);
    const [WMSTIMESLIDE, setWMSTIMESLIDE] = useState([])
    const GetTimslide = (date) => {
        API.get(`masterdata/getdateWms?startdate=${date[0].format("YYYY-MM-DD")}&enddate=${date[1].format("YYYY-MM-DD")}`).then(({ data: { items } }) => {
            console.log('items :>> ', items);
            if (items.length > 0) {
                var setwms = [];
                for (let i = 0; i < items.length; i++) {
                    let maptype = new WmsMapType(
                        items[i].id,
                        items[i].url, {
                        layers: items[i].layer_name,
                        wmsProjectKey: items[i].id,
                        type: items[i].type_server
                    }, {
                        opacity: 0
                    }, items[i].type_server
                    );
                    maptype.addToMap(map, false);
                    setwms.push(maptype);
                }
                setWMSTIMESLIDE(setwms);
            }
            setDatatimeslider(items);
        }).catch((error) => {
            // console.log('error :>> ', error);
        })
    }
    const OnPlaytimeslide = (e) => {
        if (e) {
            WMSTIMESLIDE.forEach((item) => {
                if (item.name == e.id) {
                    item.setOpacity(1);
                    item.zoomwmsnew(map);
                } else {
                    item.setOpacity(0);
                }
            });
        } else {
            WMSTIMESLIDE.forEach((item) => item.setOpacity(0));
        }
    }
    const ontimeslider = () => {
        if (slidemapshow) {
            // console.log('close :>> ');
            WMSTIMESLIDE.forEach((item) => item.removeFromMap(map));
            setWMSTIMESLIDE([]);
            setDatatimeslider([]);
        }
        setSlidemapshow(!slidemapshow);
    }
    //---------------------------------------------------------------------------------------------
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
            type: items.type_server
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
    const [visiblestreetview, setVisiblestreetview] = useState(true);
    const [streetviewdata, setStreetviewdata] = useState([]);
    const GetStreetView = () => {
        API.get(`/streetview/getAllDatStreetView`).then(({ data: { items } }) => {

            let mapdata = items.map((i) => {
                const image = {
                    url: "/assets/images/icons8-street-view-80.png",
                    scaledSize: new google.maps.Size(25, 25), // scaled size
                    // origin: new google.maps.Point(0, 0), // origin
                    // anchor: new google.maps.Point(0, 0) // anchor
                };
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(i.coordinate.lat), lng: parseFloat(i.coordinate.log) },
                    icon: image,
                    title: "คลิ้กเพื่อดูภาพ",
                });
                marker.addListener("click", () => {
                    let panorama = map.getStreetView();
                    panorama.setPosition({ lat: parseFloat(i.coordinate.lat), lng: parseFloat(i.coordinate.log) });
                    panorama.setPov({
                        heading: 0,
                        pitch: 0,
                    });
                    panorama.setVisible(true);
                });
                return marker;
            })
            setStreetviewdata(mapdata)
        }).catch((error) => {
            console.log(`error`, error)
        })
    }
    const StreetViewVisible = () => {
        if (visiblestreetview) {
            streetviewdata.forEach((i) => i.setMap(map));
        } else {
            streetviewdata.forEach((i) => i.setMap(null));
        }
        setVisiblestreetview(!visiblestreetview);
    }
    return (
        <Layout isMap={true} navbarHide={hideNavbar}>
            <Head>
                <title>PTT Land Map Application</title>
            </Head>
            {!changmap ? (
                <>
                    <div className="tools-group-layer">
                        <Tooltip placement="right" title={"GIS Layers"}>
                            <button className="btn btn-light btn-sm" onClick={() => {
                                setVisibleShapeFile(!visibleShapeFile)
                                setVisibleDashboard(false)
                                setVisibleSearch(false)
                            }}>
                                {/* <i className="fa fa-window-restore" /> */}
                                <img width="100%" src="/assets/images/fa-window-restore.png" alt="" />
                            </button>
                        </Tooltip>
                    </div>
                    <div className="tools-dashboard">
                        <Tooltip placement="right" title={"Dashboard"}>
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                    setVisibleShapeFile(false)
                                    setVisibleDashboard(!visibleDashboard)
                                    setVisibleSearch(false)
                                    apiDashboardData({ project_name: "project_na" })
                                }}
                            >
                                {/* <i className="fa fa-dashboard" /> */}
                                <img width="100%" src="/assets/images/fa-dashboard.png" alt="" />
                            </button>
                        </Tooltip>
                    </div>
                    <div className="show-street-view tools-dashboard" style={{ top: 215 }}>
                        <Tooltip placement="right" title={"ShowStreetView"}>
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                    StreetViewVisible()
                                }}
                            >
                                <img width="100%" src="/assets/images/icons8-street-view-80.png" alt="" />
                            </button>
                        </Tooltip>
                    </div>
                </>
            ) : null}
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
                    <Tooltip placement="left" title={"Imagery Layers"}>
                        <img src="assets/images/layer.PNG" alt="" width="23" />
                    </Tooltip>
                </Col>
            </div>

            <div className="tools-map-area">
                {/* Administrator And Editor */}
                {user &&
                    (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" ||
                        user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4" ||
                        user.roles_id === "0678bba5-a371-417f-9734-aec46b9579ad") ? (
                    !changmap && <Col span={6}>
                        <Tooltip
                            placement="left" title={"Search"}
                        >
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                    if (firstSearc) {
                                        apiSearchData({})
                                        setFirstSearc(false)
                                    }

                                    setVisibleShapeFile(false)
                                    setVisibleDashboard(false)
                                    setVisibleSearch(!visibleSearch)
                                }}
                            >
                                <img width="100%" src="/assets/images/search.png" />
                            </button>
                        </Tooltip>
                    </Col>

                ) : null}

                {!changmap && <Col span={6} className="pt-1">
                    <Tooltip placement="left" title={"Default"}>
                        <button className="btn btn-light btn-sm" onClick={clickHome} >
                            <img
                                width="100%"
                                src="/assets/images/home.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-1">
                    <Tooltip placement="left" title={"Distance"}>
                        <button className="btn btn-light btn-sm" onClick={clickLine} >
                            <img
                                width="100%"
                                src="/assets/images/Line.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-1">
                    <Tooltip placement="left" title={"Area Distance"}>
                        <button className="btn btn-light btn-sm" onClick={areaDistance} >
                            <img
                                width="100%"
                                src="/assets/images/polegon.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                <Col span={6} className="pt-1">
                    <Tooltip placement="left" title={"Swipe Map"}>
                        <button className="btn btn-light btn-sm" onClick={clickSplit}>
                            <img
                                width="100%"
                                src="/assets/images/-line_icon.png"
                            />
                        </button>
                    </Tooltip>
                </Col>
                {!changmap && <Col span={6} className="pt-1">
                    <Tooltip placement="left" title={"Time Silder"}>
                        <button className="btn btn-light btn-sm" onClick={ontimeslider} >
                            <img
                                width="100%"
                                src="/assets/images/arrow_back_time.png"
                            />
                        </button>
                    </Tooltip>
                </Col>}
                {!changmap && <Col span={6} className="pt-1">
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
                <Col span={24} className="pt-1">
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
            <span className="tools-map-area3 NameHighlights" hidden={changmap}   >
                <button className="btn btn-light" onClick={() => clickChangeMap()} >
                    <img className="imgChangeMap" width="90" height="90" style={{ borderRadius: "10px" }} src={imgChangeMap} alt="" />
                    <span className="txtChangeMap" style={{ position: "absolute", bottom: "15px", left: "25px", textAlign: "center" }} >
                        {txtChangeMap}
                    </span>
                </button>

                <div id="changeMap"  >
                    <span style={{ display: "flex", justifyContent: "space-around" }} >
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                            <button className="btn btn-light btn-sm terrain" onClick={() => changeMap("Terrain")} >
                                <img className="imgTerrain" width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Terrain.png" alt="" />
                            </button>
                            <h5 className="text-info" >Terrain</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm traffic" onClick={() => changeMap("Traffic")} >
                                <img className="imgTraffic" width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Traffic.png" alt="" />
                            </button>
                            <h5 className="text-info" >Traffic</h5>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <button className="btn btn-light btn-sm transit" onClick={() => changeMap("Transit")}>
                                <img className="imgTransit" width="55" height="55" style={{ borderRadius: "10px" }} src="assets/images/icon-chang-map/Transit.png" alt="" />
                            </button>
                            <h5 className="text-info" >Transit</h5>
                        </span>
                    </span>
                </div>
            </span>
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
            <Timeslide onChange={(e) => OnPlaytimeslide(e)} data={datatimeslider} onDateChange={GetTimslide} onClose={() => setSlidemapshow(false)} visible={slidemapshow} />

            {/* -----------------------------------------------------------------------------------  */}
            {/* Shape File */}
            <Drawer
                width={width <= 450 ? width <= 400 ? 300 : 400 : 450}
                placement={"left"}
                visible={visibleShapeFile}
                onClose={() => setVisibleShapeFile(false)}
                maskClosable={false}
                style={{ width: visibleShapeFile ? 550 : 0 }}
            >
                <Tabs defaultActiveKey="1" type="card" size={size}>
                    <TabPane tab="ชั้นข้อมูล" key="1">
                        {groupLayerList.map((e, i) =>
                            Object.assign(
                                <div className="pt-2" key={`maps-${e.id}`}>
                                    <Collapse
                                        collapsible={!e.children || e.children.length <= 0 ? "disabled" : "vertical"}
                                        expandIcon={({ isActive }) => e.symbol ? (
                                            <>
                                                <img src={e.symbol} width={20} />
                                                <span style={{ fontFamily: "Prompt, sans-serif", lineHeight: "1.5715", fontSize: "14px", padding: "12px 16px" }}>{e.group_name}</span>
                                                {
                                                    e.children.length !== 0 && <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ float: "right", lineHeight: "1.5715", fontSize: "14px" }} />
                                                }
                                            </>
                                        ) : <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                    >
                                        <Panel
                                            key={i}>
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
                                                                        x.checked && x.type != "wms" ?
                                                                            <a onClick={() => goTolayer(x.id)}>
                                                                                <ExpandOutlined />
                                                                            </a> : null
                                                                    }
                                                                </Col>
                                                                {
                                                                    x.checked && x.type_geo != "Point" && x.type != "wms" ?
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
                                                                        : null
                                                                }
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
                                    onFinish={onFinishUpload}
                                    onFinishFailed={onFinishFailedUpload}
                                    autoComplete="off"
                                    size={"small"}
                                // layout="vertical"
                                >

                                    <Form.Item
                                        label="ชื่อชั้นข้อมูล"
                                        name="name_layer"
                                        rules={[{ required: true, message: "กรุณากรอกข้อมูล!" }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="เลือกชั้นข้อมูล"
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
                                        label="เลือกไฟล์"
                                        rules={[{ required: true, message: "กรุณาเลือกไฟล์!" }]}
                                    >
                                        <Upload
                                            onChange={handleChange}
                                            action={callbackActionUpload}
                                            fileList={FileList}
                                            multiple={false}
                                        >
                                            <Button icon={<UploadOutlined />}>Upload</Button>
                                        </Upload>
                                    </Form.Item>

                                    {FileType ? <Form.Item label="ประเภทไฟล์">{FileType}</Form.Item> : null}

                                    {FileType !== "Point" ?
                                        <>
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
                                                            onChange={({ rgb, hex }) => {
                                                                setColorUpload({ ...colorUpload, rgb, hex })


                                                            }}
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

                                            <Form.Item label="Opacity" name="Opacity">
                                                <Row>
                                                    <Col span={12}>
                                                        <Slider
                                                            min={0}
                                                            max={1}
                                                            step={0.01}
                                                            onChange={(value) => {
                                                                setInputValueOpacityColor(value)
                                                            }}
                                                            value={typeof inputValueOpacityColor === 'number' ? inputValueOpacityColor : 0}
                                                        />
                                                    </Col>
                                                    <Col span={4}>
                                                        <InputNumber
                                                            min={0}
                                                            max={1}
                                                            style={{ margin: '0 16px' }}
                                                            step={0.01}
                                                            value={inputValueOpacityColor}
                                                            onChange={(value) => {
                                                                setInputValueOpacityColor(value)
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Form.Item>

                                            <Form.Item label="สีกรอบ">
                                                <Color color={colorFrame} onChangeColor={({ rgb, hex }) => setColorFrame({ ...colorUpload, rgb, hex })} callbackSaveColor={(velue) => {
                                                    console.log('velue Save :>> ', velue);
                                                }} />
                                            </Form.Item>

                                            <Form.Item label="ความหนากรอบ">
                                                <Row>
                                                    <Col span={12}>
                                                        <Slider
                                                            min={0}
                                                            max={10}
                                                            step={0.01}
                                                            onChange={(value) => {
                                                                setInputValueStrokColor(value)
                                                            }}
                                                            value={typeof inputValueStrokColor === 'number' ? inputValueStrokColor : 0}
                                                        />
                                                    </Col>
                                                    <Col span={4}>
                                                        <InputNumber
                                                            min={0}
                                                            max={10}
                                                            style={{ margin: '0 16px' }}
                                                            step={0.01}
                                                            value={inputValueStrokColor}
                                                            onChange={(value) => {
                                                                setInputValueStrokColor(value)
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Form.Item>
                                        </>
                                        : null}
                                    {FileType === "Point" ? (
                                        <>
                                            <Form.Item
                                                label="Upload"
                                            >
                                                <Radio.Group value="กำหนดเอง" onChange={onChangeDefaultPoint} value={radioPoint}>
                                                    <Radio value={"กำหนดเอง"}>กำหนดเอง</Radio>
                                                    <Radio value={"Default"}>Default</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            <Form.Item
                                                label="Symbol"
                                                // rules={[{ required: true, message: "กรุณาเลือกไฟล์!" }]}
                                                extra="ขนาดแนะนำ 25X35"
                                                className="uploadUser"
                                            >
                                                <Upload
                                                    onChange={handleChangeSymbol}
                                                    action={`${process.env.NEXT_PUBLIC_SERVICE}/demo/resTrue`}
                                                    fileList={FileListSymbol}
                                                    multiple={false}
                                                >
                                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                                </Upload>

                                            </Form.Item>
                                            <Form.Item
                                                label="Symbol"
                                                style={{ display: "none" }}
                                                className="defaultPoint"
                                            >
                                                <div className="dropdownDefaultPoint">
                                                    <Button >Default</Button>
                                                    <p className="text-muted">{textImgDefault}</p>
                                                    <div className="flexbox flex_point" >
                                                        {/* <div className="item">
                                                            <div className="content ">
                                                                <img className="Circle3 defalutImage" src="assets/images/symbol_point/IMG_0467.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0467.png", "circle", "circle")} />
                                                                <p>Circle</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="Circle40 defalutImage" src="assets/images/symbol_point/IMG_0476.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0476.png", "square", "square")} />
                                                                <p>Square</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content ">
                                                                <img className="Circle4 defalutImage" src="assets/images/symbol_point/IMG_0484.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0484.png", "triangle", "triangle")} />
                                                                <p>Triangle</p>
                                                            </div>
                                                        </div> */}
                                                        <div className="item">
                                                            <div className="content ">
                                                                <img className=" Circle5 defalutImage" src="assets/images/symbol_point/IMG_0470.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0470.png", "Circle5", "Circle5")} />
                                                                <p>Circle5</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Circle6" src="assets/images/symbol_point/IMG_0471.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0471.png", "Circle6", "Circle6")} />
                                                                <p>Circle6</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square1" src="assets/images/symbol_point/IMG_0472.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0472.png", "Square1", "Square1")} />
                                                                <p>Square1</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square140" src="assets/images/symbol_point/IMG_0473.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0473.png", "Square140", "Square1 (40%)")} />
                                                                <p>Square1 (40%)</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square2" src="assets/images/symbol_point/IMG_0475.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0475.png", "Square2", "Square2")} />
                                                                <p>Square2</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square3" src="assets/images/symbol_point/IMG_0476.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0476.png", "Square3", "Square3")} />
                                                                <p>Square3</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square340" src="assets/images/symbol_point/IMG_0477.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0477.png", "Square340", "Square3 (40%)")} />
                                                                <p>Square3 (40%)</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square4" src="assets/images/symbol_point/IMG_0478.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0478.png", "Square4", "Square4")} />
                                                                <p>Square4</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square5" src="assets/images/symbol_point/IMG_0479.png" alt="" onClick={() => onSelectImageDefault("IMG_0479.png", "Square5", "Square5")} />
                                                                <p>Square5</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Square6" src="assets/images/symbol_point/IMG_0480.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0480.png", "Square6", "Square6")} />
                                                                <p>Square6</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Triangle1" src="assets/images/symbol_point/IMG_0481.png" alt="" onClick={() => onSelectImageDefault("IMG_0481.png", "Triangle1", "Triangle1")} />
                                                                <p>Triangle1</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Triangle140" src="assets/images/symbol_point/IMG_0482.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0482.png", "Triangle140", "Triangle1 (40%)")} />
                                                                <p>Triangle1 (40%)</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Triangle2" src="assets/images/symbol_point/IMG_0483.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0483.png", "Triangle2", "Triangle2")} />
                                                                <p>Triangle2</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Triangle3" src="assets/images/symbol_point/IMG_0484.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0484.png", "Triangle3", "Triangle3")} />
                                                                <p>Triangle3</p>
                                                            </div>
                                                        </div>
                                                        <div className="item">
                                                            <div className="content">
                                                                <img className="defalutImage Triangle340" src="assets/images/symbol_point/IMG_0485.PNG" alt="" onClick={() => onSelectImageDefault("IMG_0485.png", "Triangle340", "Triangle3 (40%)")} />
                                                                <p>Triangle3 (40%)</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form.Item>
                                            {
                                                radioPoint !== "กำหนดเอง" && imgpontgen &&
                                                <img src={imgpontgen} width="80%" height="50%" align="center" valign="center" alt="" disabled />
                                            }
                                        </>
                                    ) : null}

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
                width={width <= 750 ? width <= 400 ? 300 : 400 : 750}
                // title="Process ส่งมอบโครงการ"
                title={false}
                placement={"left"}
                visible={visibleDashboard}
                onClose={() => setVisibleDashboard(!visibleDashboard)}
                maskClosable={false}
                style={{ width: visibleDashboard ? 650 : 0 }}
            >
                <>
                    <div style={{ backgroundColor: "#4b5159", padding: "22px 22px 0px 22px" }}>
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
                                <div className="col-md-4">
                                    <Form.Item
                                        label=""
                                        name="search"
                                    >
                                        <Input placeholder="Search" />
                                    </Form.Item>
                                </div>
                                <div className="col-md-3">
                                    <Form.Item
                                        label=""
                                        name="project_name"
                                    >
                                        <Select
                                            placeholder="ชื่อโครงการ"
                                            allowClear
                                        >
                                            <Option value="project_na">ชื่อโครงการ</Option>
                                            <Option value="parlabel1">เลขที่โฉนด</Option>
                                            <Option value="objectid">ลำดับแปลงที่ดิน</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-md-3">
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
                                <div className="col-md-2">

                                    {width > 750 ? <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            ค้นหา
                                        </Button>
                                    </Form.Item> : null}

                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
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
                                <div className="col-md-4">
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
                                <div className="col-md-4">
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
                                {width <= 750 ?
                                    <div className="col-md-12">
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit">
                                                ค้นหา
                                            </Button>
                                        </Form.Item>
                                    </div> : null}
                            </div>


                        </Form>
                    </div>
                    <hr />
                    <h3>แปลง ({sumDashboard.plot.toLocaleString()}  แปลง)</h3>
                    <div className="row">
                        <div className={width <= 750 ? "col-12" : "col-8"}>
                            <Doughnut
                                data={{
                                    labels: plotDashboard.labels,
                                    datasets: plotDashboard.datasets
                                }}
                                options={option}
                            />
                        </div>
                        <div className={width <= 750 ? "col-12" : "col-4"}>
                            {plotDashboard.list.map((e, i) => <p key={`plotDashboard-${i}`}><b>{e.name}</b> : {e.value} แปลง</p>)}
                        </div>
                    </div>

                    <hr />

                    <h3>ระยะทาง ({sumDashboard.distance.toLocaleString()} ก.ม.)</h3>
                    <div className="row">
                        <div className={width <= 750 ? "col-12" : "col-8"}>
                            <Doughnut
                                data={{
                                    labels: distanceDashboard.labels,
                                    datasets: distanceDashboard.datasets
                                }}
                                options={option}
                            />
                        </div>
                        <div className={width <= 750 ? "col-12" : "col-4"}>
                            {distanceDashboard.list.map((e, i) => <p key={`distanceDashboard-${i}`}><b>{e.name}</b> : {e.value} ก.ม.</p>)}
                        </div>
                    </div>

                </>

            </Drawer>

            {/* Search */}
            <Drawer
                id="drawer-searchwa"
                width={width <= 650 ? width <= 400 ? 300 : 400 : 650}
                title={false}
                placement={"left"}
                visible={visibleSearch}
                onClose={() => setVisibleSearch(!visibleSearch)}
                maskClosable={false}
                style={{ width: visibleSearch ? 650 : 0, }}
            >
                <div style={{ backgroundColor: "#4b5159", padding: "22px 22px 0px 22px" }}>
                    <Form
                        form={formSearch}
                        onFinish={onFinishSearch}
                        onFinishFailed={onFinishFailedSearch}
                        layout="vertical"
                        autoComplete="off"
                    >

                        {/* Row 1 */}
                        <div className="row">
                            <div className="col-md-10">
                                <Form.Item
                                    label=""
                                    name="search"
                                >
                                    <Input placeholder={placeholderSearch} />
                                </Form.Item>
                            </div>
                            <div className="col-md-2">
                                {width > 650 ?
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                                            ค้นหา
                                        </Button>
                                    </Form.Item>
                                    : null}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="row">
                            <div className="col-md-3">
                                <Form.Item
                                    label=""
                                    name="layer_group"
                                >
                                    <Select
                                        placeholder="ชั้นข้อมูล"
                                        allowClear
                                        onChange={(value) => getDataNameProject(value)}
                                    >
                                        {layerList.map(e => <Option key={`name-layer-${e.id}`} value={e.id}>{e.name_layer}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>

                            <div className="col-md-3">
                                <Form.Item
                                    label=""
                                    name="project_name"
                                >
                                    <Select
                                        placeholder="ชื่อโครงการ"
                                        allowClear
                                    >
                                        {projectNameListSearch.map((e, i) => <Option key={`project-name-${i}`} value={e}>{e}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>

                            <div className="col-md-3">
                                <Form.Item
                                    label=""
                                    name="select_search"
                                >
                                    <Select
                                        placeholder="เลือกจาก"
                                        allowClear
                                    >
                                        <Option value="parid">ลำดับแปลงที่ดิน</Option>
                                        <Option value="parlabel1">เลขที่เอกสารสิทธิ์</Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <div className="col-md-3">
                                <Form.Item
                                    label=""
                                    name="document_name"
                                >
                                    <Select
                                        placeholder="ประเภทเอกสารสิทธิ์"
                                        allowClear
                                    >
                                        {documentNameListSearch.map((e, i) => <Option key={`document-name-${i}`} value={e}>{e}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="row">
                            <div className="col-md-4">
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
                            <div className="col-md-4">
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
                            <div className="col-md-4">
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
                            {width <= 650 ? <div className="col-md-12">
                                <Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            ค้นหา
                                        </Button>
                                    </Form.Item>
                                </Form.Item>
                            </div> : null}
                        </div>


                    </Form>
                </div>
                <hr />

                <div>
                    <Row>
                        <Col span={12}>
                            <h4 className="pb-3">พบข้อมูลจำนวน <span className="text-red">{amount.toLocaleString()}</span> Record(s)</h4>
                        </Col>
                        <Col span={12} style={{ textAlign: "end" }}>
                            <Tooltip placement="bottom" title={"Details"}>
                                <a style={{ fontSize: 18 }} onClick={() => setModeSearch("Detail")} ><UnorderedListOutlined /></a>
                            </Tooltip>
                            &nbsp;&nbsp;&nbsp;
                            <Tooltip placement="bottom" title={"Lists"}>
                                <a style={{ fontSize: 18 }} onClick={() => setModeSearch("Table")}><TableOutlined /></a>
                            </Tooltip>
                        </Col>
                    </Row>
                    <>
                        {
                            loadingSearch ?
                                <Spin size="large" className="mx-auto" style={{ width: "100%" }} />
                                :
                                searchList.length > 0 ?
                                    modeSearch === "Detail" ?
                                        <div>
                                            {
                                                searchList.map((e, i) => (
                                                    <div key={`SearchList-${i}`}>
                                                        {e.index.toLocaleString()})
                                                        <div className="row pt-2">
                                                            <div className="col-md-1">
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
                                                            <div className="col-md-11">

                                                                <div className="row">
                                                                    <label>{getTextThaiObjShape("project_name")} :</label>
                                                                    <p className="pl-3">{e.project_na}</p>
                                                                </div>

                                                                <div className="row">
                                                                    <label>{getTextThaiObjShape("partype")} :</label>
                                                                    <p className="pl-3">{e.partype}</p>
                                                                </div>

                                                                <div className="row">
                                                                    <label>{getTextThaiObjShape("parid")} :</label>
                                                                    <p className="pl-3">{e.parid}</p>
                                                                </div>

                                                                <div className="pl-2">
                                                                    <div className="row">
                                                                        <div className="col-md-4">
                                                                            <div className="row">
                                                                                <label>{getTextThaiObjShape("parlabel1")} :</label>
                                                                                <p className="pl-3">{e.parlabel1}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="row">
                                                                                <label>{getTextThaiObjShape("parlabel2")} :</label>
                                                                                <p className="pl-3">{e.parlabel2}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="row">
                                                                                <label>{getTextThaiObjShape("parlabel3")} :</label>
                                                                                <p className="pl-3">{e.parlabel3}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="row">
                                                                        <div className="col-md-5">
                                                                            <div className="row">
                                                                                <label>{getTextThaiObjShape("parlabel4")} :</label>
                                                                                <p className="pl-3">{e.parlabel4}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-5">
                                                                            <div className="row">
                                                                                <label>{getTextThaiObjShape("parlabel5")} :</label>
                                                                                <p className="pl-3">{e.parlabel5}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-2">
                                                                            {(user && (user.roles_id === "8a97ac7b-01dc-4e06-81c2-8422dffa0ca2" || user.roles_id === "cec6617f-b593-4ebc-9604-3059dfee0ac4")) ?
                                                                                <button className="btn" onClick={() => editShapefileSearch(e, i)}><EditFilled /></button> : null}
                                                                            <Switch size="small" checked={e.checked} onChange={(value) => switchGeom(value, e, i)} />
                                                                            {e.checked ?
                                                                                <button className="btn" onClick={() => goTolayer(e.index, "search")}>
                                                                                    <ExpandOutlined />
                                                                                </button> : null}
                                                                        </div>
                                                                    </div>

                                                                    {e.link ?
                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <div className="row">
                                                                                    <label>link :</label>
                                                                                    <a className="pl-3" href={e.link} style={{ color: "#007bff" }}>{e.link}</a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        : null}
                                                                </div>


                                                            </div>

                                                        </div>
                                                        <hr />
                                                    </div>
                                                ))
                                            }
                                            <div style={{ textAlign: "center" }}>
                                                {/* {amount >= sumData ? <button className="btn btn-primary" onClick={pushSearchData}>โหลดเพิ่มเติม</button> : null} */}
                                                <Pagination current={pageDetailSearch} total={amount} onChange={paginationSearchData} />
                                            </div>
                                        </div> :
                                        modeSearch === "Table" ?
                                            <div>
                                                <Table dataSource={searchAllList} columns={columnsSearch} rowKey={(row) => row.id} scroll={{ x: "100%", y: "100%" }} pagination={{
                                                    current: pageSearch,
                                                    total: totalSearch,
                                                    pageSize: limitSearch,
                                                    showTotal: (total, range) => `ข้อมูล ${range[0]} - ${range[1]} ทั้งหมด ${total.toLocaleString()} รายการ`,
                                                    onChange: async (e, _limit) => {
                                                        setPageSearch(e)
                                                        if (limitSearch !== _limit) setLimitSearch(_limit)
                                                    }
                                                }} />
                                            </div>
                                            : null
                                    : <h3 style={{ color: "red", textAlign: "center" }}>ไม่พบข้อมูลคำค้นหา</h3>
                        }
                    </>

                </div>
            </Drawer>

            {/* Modal Search */}
            <Modal
                maskClosable={false}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
                title={modeInfoSearch === "view" ? "ดูข้อมูล" : "แก้ไขข้อมูล"}
                visible={visibleModalSearch}
                onOk={handleOkModalSearch}
                onCancel={handleCancelModalSearch}
                okButtonProps={{ disabled: modeInfoSearch === "view" }}
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
                                    label={getTextThaiObjShape(e.label)}
                                    name={e.name}
                                    rules={[{ required: e.required, message: e.message }]}
                                >
                                    <Select
                                        placeholder={e.label}
                                        allowClear
                                        disabled={e.disabled || modeInfoSearch === "view" ? true : false}
                                    >
                                        {e.list.map((x, index) => <Option key={`select-${e.name}-${index}`} value={x[e.value]}>{x[e.text]}</Option>)}
                                    </Select>
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    key={`form-modal-search-${i}`}
                                    label={getTextThaiObjShape(e.label)}
                                    name={e.name}
                                    rules={[{ required: e.required, message: e.message }]}
                                >
                                    <Input disabled={e.disabled || modeInfoSearch === "view" ? true : false} />
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
                width={400}
                maskClosable={false}
                style={{ width: visibleRaster ? 350 : 0 }}
            >
                <Tabs defaultActiveKey="1" style={{ marginBottom: "100px", padding: "5px" }}>
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
                                rasterDataDron1.length > 6 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "230px" }} className="text-info" hidden={showMoreDron.dron1} onClick={() => { setLoadmore1({ ...loadmore1, dronMore: rasterDataDow1.length }), setShowMoreDron({ ...showMoreDron, dron1: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <b className="text-info pt-5">ภาพถ่ายดาวเทียม</b>
                        <Row className="pt-3 pb-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                changmap ? (
                                    <Col span={8}>
                                        <Card
                                            className={dowSwipeMap.mapLeft ? "cardwa" : ""}
                                            onClick={() => clickdowSwipMap("left")}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            hoverable
                                            style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                            cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwyYk7BSUClNOfiGhMybXiO4KbV0xOI8nOg_Qy9T9quhUOT4fNB8ZcUrcTPinYtaEsLFU&usqp=CAU`} />}
                                        >
                                            <p style={{ flexWrap: "wrap" }}>ภาพถ่ายดาวเทียม</p>
                                            {
                                                dowSwipeMap.mapLeft ? <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                    : null
                                            }
                                        </Card>
                                    </Col>
                                ) : null
                            }
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
                                rasterDataDow1.length > 6 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "230px" }} className="text-info" hidden={showMoreDow.dow1} onClick={() => { setLoadmore1({ ...loadmore1, dowMore: rasterDataDow1.length }), setShowMoreDow({ ...showMoreDow, dow1: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <div style={{ position: "absolute", bottom: "0px", height: "70px", width: "300px", backgroundColor: "#fff", padding: "5px" }}>
                            <span><b>Transparent</b></span>
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
                                rasterDataDron1.length > 6 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "230px" }} className="text-info" hidden={showMoreDron.dron2} onClick={() => { setLoadmore2({ ...loadmore2, dronMore: rasterDataDow1.length }), setShowMoreDron({ ...showMoreDron, dron2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <b className="text-info pt-5">ภาพถ่ายดาวเทียม</b>
                        <Row className="pt-3 pb-3" gutter={[16, 5]} style={{ margin: 0 }}>
                            {
                                changmap ? (
                                    <Col span={8}>
                                        <Card
                                            className={dowSwipeMap.mapRight ? "cardwa" : ""}
                                            onClick={() => clickdowSwipMap("right")}
                                            bodyStyle={{ padding: "5px", }}
                                            bordered={false}
                                            hoverable
                                            style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                            cover={<img style={{ objectFit: "cover", height: "70px" }} alt="example" src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwyYk7BSUClNOfiGhMybXiO4KbV0xOI8nOg_Qy9T9quhUOT4fNB8ZcUrcTPinYtaEsLFU&usqp=CAU`} />}
                                        >
                                            <p style={{ flexWrap: "wrap" }}>ภาพถ่ายดาวเทียม</p>
                                            {
                                                dowSwipeMap.mapRight ? <EyeFilled style={{ position: "absolute", bottom: "5px", right: "5px", color: "#0f7fff" }} />
                                                    : null
                                            }
                                        </Card>
                                    </Col>
                                ) : null
                            }
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
                                rasterDataDow1.length > 6 ? (
                                    <h5 style={{ cursor: "pointer", marginLeft: "230px" }} className="text-info" hidden={showMoreDow.dow2} onClick={() => { setLoadmore2({ ...loadmore2, dowMore: rasterDataDow1.length }), setShowMoreDow({ ...showMoreDow, dow2: true }) }}>
                                        ...Load More
                                    </h5>
                                ) : null
                            }
                        </Row>
                        <div style={{ position: "absolute", bottom: "0px", height: "70px", width: "300px", backgroundColor: "#f1eded", padding: "5px" }}>
                            <span><b>Transparent</b></span>
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
                {` .ant-collapse > .ant-collapse-item > .ant-collapse-header {
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

          .container-fluid-map {
            padding-top:  ${containerFluidMap}px;
          }
          .ant-collapse>.ant-collapse-item>.ant-collapse-header {
            position: relative;
            /* padding: initial; */
        }
        .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            position: relative;
            padding: 12px 16px;
            color: rgba(0, 0, 0, 0.85);
            line-height: 1.5715;
            cursor: pointer;
            -webkit-transition: all 0.3s, visibility 0s;
            transition: all 0.3s, visibility 0s;
        }

        .ant-drawer-content {
            position: relative;
            z-index: 1;
            overflow: auto;
            background-color: #ececec;
            background-clip: padding-box;
            border: 0;
        }

        .ant-collapse {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            margin-top: 0;
            padding: 0;
            color: rgba(0, 0, 0, 0.85);
            font-size: 14px;
            font-variant: tabular-nums;
            line-height: 1.5715;
            list-style: none;
            -webkit-font-feature-settings: 'tnum', "tnum";
            -moz-font-feature-settings: 'tnum', "tnum";
            font-feature-settings: 'tnum', "tnum";
            background-color: #fff;
            box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
            border: 1px solid #b6bdbd;
            border-radius: 5px;
            margin-bottom: 5px
        }
        .ant-card {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            color: rgba(0, 0, 0, 0.85);
            font-size: 14px;
            font-variant: tabular-nums;
            line-height: 1.5715;
            list-style: none;
            -webkit-font-feature-settings: 'tnum', "tnum";
            -moz-font-feature-settings: 'tnum', "tnum";
            font-feature-settings: 'tnum', "tnum";
            position: relative;
            border-radius: 5px;;
        }

        .ant-card-bordered {
            border: 2px solid #b6bdbd;
            border-radius: 10px;
        }

        .ant-drawer-body {
            -webkit-flex-grow: 1;
            -moz-box-flex: 1;
            flex-grow: 1;
            padding: 24px 40px 24px 24px;
            overflow: auto;
            font-size: 14px;
            line-height: 1.5715;
            word-wrap: break-word;
            margin-top: 10%;
            background-color:#fff;
        }

        .ant-drawer-header-no-title .ant-drawer-close {
            margin-right: var(--scroll-bar);
            padding-right: -webkit-calc(20px - var(--scroll-bar));
            padding-right: calc(20px - var(--scroll-bar));
            margin-top: 13%;
        }

        .header {
            /* z-index: 100; */
        }
        .header {
            background: #008cff;
            border-bottom: 1px solid #ededed;
            -webkit-box-shadow: 0 1px 1px 0 rgb(0 0 0 / 20%);
            box-shadow: 0 1px 1px 0 rgb(0 0 0 / 20%);
            height: 60px;
            left: 0;
            position: fixed;
            right: 0;
            top: 0;
            z-index: 1002;
        }

        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active, .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab-active {
            background: #ececec;
        }

        .ant-tabs-top > .ant-tabs-nav::before, .ant-tabs-bottom > .ant-tabs-nav::before, .ant-tabs-top > div > .ant-tabs-nav::before, .ant-tabs-bottom > div > .ant-tabs-nav::before {
            position: absolute;
            right: 0;
            left: 0;
            border-bottom: 1px solid #cccaca;
            content: '';
            z-index: 1002;
        }

        .ant-tabs-card.ant-tabs-top > .ant-tabs-nav .ant-tabs-tab, .ant-tabs-card.ant-tabs-top > div > .ant-tabs-nav .ant-tabs-tab {
            border-radius: 2px 2px 0 0;
            border-color: rgb(201 180 180 / 45%);
        }

        .ant-pagination-item-active a {
            color: #1890ff !important;
        }

         {/* .ant-tabs-card > .ant-tabs-nav .ant-
             padding: 8px 16px;
             background: #cccaca;
             border: 1px solid #999999;
             -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
             transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
         }
         tabs-tab, .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab {
             margin: 0; */}

             .col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-auto, .col-md, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-auto, .col-sm, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-auto, .col-xl, .col-xl-1, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-auto {
                position: relative;
                width: 100%;
                padding-right: 5px;
                padding-left: 5px;
            }

            .table-striped tbody tr:nth-of-type(odd) {
                background-color: #d4e4f3;
              }

              .ant-input[disabled] {
                color: #000;
            }

            .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                color: rgb(0 0 0);
            }

            #infoBox .table td, .table th {
                padding: 0.35rem;
                width: 50%;
            }
        `}
            </style>
        </Layout >
    );
};

export default mapPage;
