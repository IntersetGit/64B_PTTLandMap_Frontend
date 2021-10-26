import React, { useState } from 'react'
import { SketchPicker } from "react-color";

const Color = ({ onChangeColor, callbackSaveColor, color }) => {
    const [openColorUpload, setOpenColorUpload] = useState(false)
    const [colorMe, setColorMe] = useState({
        hex: "red",
        rgb: { r: 255, g: 0, b: 0, a: 1 },
    })

    const clickSaveColor = () => {
        console.log('colorMe :>> ', colorMe);
        callbackSaveColor(colorMe)
        setOpenColorUpload(!colorMe)
    }

    return (
        <>
            <a onClick={() => setOpenColorUpload(!openColorUpload)}>
                <div
                    style={{
                        width: "36px",
                        height: "20px",
                        borderRadius: "2px",
                        background: color ? color.hex : colorMe.hex,
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
                        color={color ? color.rgb : colorMe.rgb}
                        onChange={(value) => {
                            onChangeColor(value)
                            setColorMe({ ...colorMe, hex: value.hex, rgb: value.rgb })
                        }}
                    />
                    <footer className="footer-color">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={clickSaveColor}
                        >
                            save
                        </button>
                    </footer>
                </div>
            ) : null}
        </>
    )
}

export default Color
