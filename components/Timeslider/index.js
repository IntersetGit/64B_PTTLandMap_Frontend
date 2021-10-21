import React, { useState, useEffect, useRef } from 'react'
import styles from './styles.module.css'
import {
    CalendarOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    RightCircleOutlined,
    LeftCircleOutlined
} from '@ant-design/icons';
import { Slider, Button } from 'antd';
import styled from 'styled-components';
import Image from 'next/image'
import { DatePicker, ConfigProvider } from 'antd';
const { RangePicker } = DatePicker;

const RangePickerCustom = styled(RangePicker)`
    .ant-picker-panel-container.ant-picker-panels {
    background-color: antiquewhite;
} `;
const SliderCustom = styled(Slider)`
        .ant-slider-dot {
        position: absolute;
        top: -2px;
        width: 4px;
        height: 14px;
        margin-left: -2px;
        background-color: #989898;
        cursor: pointer;
        border: none;
        border-radius:0;
        }`;


let testdata = [
    {
        name: "22/12/64",
        wms: "http://asdasdasdasdas.com"
    },
    {
        name: "23/12/64",
        wms: "http://asdasdasdasdas55.com"
    },
    {
        name: "24/12/64",
        wms: "http://asdasdasdasdas.com"
    },
    {
        name: "25/12/64",
        wms: "http://asdasdasdasdas55.com"
    },
    {
        name: "26/12/64",
        wms: "http://asdasdasdasdas.com"
    },
    {
        name: "27/12/64",
        wms: "http://asdasdasdasdas55.com"
    },

]

function Timeslide({ data = testdata, onChange = (e) => { }, onDateChange = (e) => { }, onClose, keynameshow = "name", visible = true }) {
    const intervalIdRef = useRef(0);
    const [isRunning, setIsRunning] = useState(false);

    const [max, setMax] = useState(0);
    const [value, setValue] = useState(0);
    const [marks, setMarks] = useState({})
    const [hackValue, setHackValue] = useState();
    const [datevalue, setDatevalue] = useState();
    const [dates, setDates] = useState([]);
    const [showdatetime, setShowdatetime] = useState(false);

    useEffect(() => {
        let ob = { 0: "" }

        data.forEach((item, index) => {
            ob[(index + 1) * 10] = { ...item, label: item[keynameshow], style: { color: '#ffffff', } };
        })
        let max = (Object.keys(ob).length - 1) * 10;
        setMax(max);
        setMarks({ ...ob })
        dragElement(document.getElementById("mydiv"));
        dragElement(document.getElementById("datepicker"));

    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalIdRef.current = setInterval(() => {
                setValue((v) => v + 10);
            }, 2000);
            console.log("run");
        }
        return () => {
            console.log("clear");
            return clearInterval(intervalIdRef.current);
        };
    }, [isRunning]);

    useEffect(() => {
        onChange(value)
        let key = Object.keys(marks);
        if (value > key[key.length - 1] || value < key[0]) {
            setValue(0);
            setIsRunning(false);
        }
    }, [value])

    useEffect(() => {
        if (datevalue) {
            onDateChange(datevalue)
        }
    }, [datevalue]);
    const Nextstep = () => {
        setValue((v) => v + 10);
    }
    const Previewstep = () => {
        setValue((v) => v - 10);
    }

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // --------------------------------------------------------------------------
    const disabledDate = current => {
        if (!dates || dates.length === 0) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') > 7;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > 7;
        return tooEarly || tooLate;
    };

    const onOpenChange = open => {
        if (open) {
            setHackValue([]);
            setDates([]);
        } else {
            setHackValue(undefined);
        }
    };

    return (
        <div style={{ display: `${visible ? "block" : "none"}` }}>
            <div className={styles.datepicker} style={{ display: `${showdatetime ? "flex" : "none"}` }} id="datepicker">
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <span></span>
                    <span style={{ textAlign: "center", marginBottom: "5px", color: "white", fontSize: "20px", fontWeight: "bold" }}>Time Slider</span>
                    <span onClick={() => setShowdatetime(!showdatetime)} style={{ fontSize: "20px", color: "#FFF", float: "right", cursor: "pointer" }}>x</span>
                </div>
                <RangePickerCustom
                    value={hackValue || datevalue}
                    disabledDate={disabledDate}
                    onCalendarChange={val => setDates(val)}
                    onChange={val => setDatevalue(val)}
                    onOpenChange={onOpenChange}
                />
                <Button type="primary" size="middle" style={{ width: "100px", alignSelf: "flex-end", marginTop: "8px", fontWeight: "bold" }}>Start</Button>
            </div>
            <div id="mydiv">
                {/* -----------------------------PLAYER--------------------------------------------- */}
                <div className={[styles.timeslidebody]}>
                    <div className={styles.date} onClick={() => setShowdatetime(!showdatetime)}>
                        <span style={{ color: "white", fontWeight: "bold" }}>DATE</span>
                        <Image src="/assets/images/Calender.PNG" width={35} height={35} />
                    </div>
                    <div className={styles.player}>
                        <div className="btnplay" style={{ width: "10%", display: 'flex', justifyContent: "center" }}>
                            {isRunning ?
                                <PauseCircleOutlined onClick={() => setIsRunning(!isRunning)} style={{ fontSize: "35px ", color: "#FFF" }} />
                                :
                                <PlayCircleOutlined onClick={() => setIsRunning(!isRunning)} style={{ fontSize: "35px ", color: "#FFF" }} />
                            }
                        </div>
                        <div className="btnleft" style={{ width: "5%", textAlign: "center" }}>
                            <LeftCircleOutlined onClick={Previewstep} style={{ fontSize: "25px ", color: "#FFF", }} />
                        </div>
                        <div className={styles.slide} style={{ width: "80%", flexDirection: "column", }}>
                            <span style={{ color: "white", fontWeight: "bold", padding: "0 5px" }}>Time Slider</span>
                            <span style={{ color: "white", fontWeight: "bold", padding: "0 5px" }}>{marks && marks[value]?.label ? marks[value]?.label : ""}</span>
                            <SliderCustom onChange={e => setValue(e)} value={value} tipFormatter={(e) => marks[e]?.label || e} step={10} max={max} marks={marks} defaultValue={0} trackStyle={{ backgroundColor: "#BC9945", }} />
                        </div>
                        <div className="btnright" style={{ width: "5%", textAlign: "center" }}>
                            <RightCircleOutlined onClick={Nextstep} style={{ fontSize: "25px ", color: "#FFF" }} />
                        </div>
                    </div>
                    <div className={styles.close} onClick={onClose} >
                        <span style={{ fontSize: "30px", color: "#FFF" }}>x</span>
                    </div>
                </div>

                <style global jsx>{`
            #mydiv {
            position: absolute;
            z-index: 9;
            left: 50%;
            bottom: 20px;
            transform: translate(-50%, -50%);
            margin: 0 auto;
            }
            .ant-picker-panel-container{
                background-color: #383A38;
            }
            .ant-picker-cell .ant-picker-cell-inner{
                color:white;
            }
            .ant-picker-content th {
                color: rgb(255 255 255 / 100%);
            }
            .ant-picker-header button{
                color: rgb(255 255 255 / 100%);
            }
                 `}</style>
            </div>
        </div>
    )
}

export default Timeslide
