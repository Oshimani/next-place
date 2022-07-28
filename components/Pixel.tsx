import React, { useContext } from 'react'
import { useHover } from '@mantine/hooks'
import AppContext from '../contexts/AppContext'
import { SocketEvents } from '../models/events'
import { IPixel } from '../models/field'

const Pixel = (props: { pixel: IPixel }) => {
    const { pixel } = props
    const { x, y, color } = pixel

    const { selectedColor, socket } = useContext(AppContext)

    const { hovered, ref } = useHover()

    const size = 64

    const handleOnClick = () => {
        if (!selectedColor) return
        console.log("claimed pixel", x, y, selectedColor)
        socket?.emit(SocketEvents.CLAIM_PIXEL, { pixel: { ...pixel, color: selectedColor } })
    }

    return (
        <div ref={ref}
            onMouseDown={() => handleOnClick()}
            style={{
                height: size, width: size,
                backgroundColor: color,
                border: "1px solid grey",

                // hovered and color is selected
                ...(hovered && selectedColor ? {
                    cursor: 'pointer',
                    transform: 'scale(1.1)',
                    backgroundColor: selectedColor
                }
                    :
                    {}
                )
            }}
        >
        </div >
    )
}

export default Pixel