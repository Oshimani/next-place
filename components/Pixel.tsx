import { useHover } from '@mantine/hooks'
import React, { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import { SocketEvents } from '../models/events'
import { Coordinates } from '../models/field'
import { Pixel } from '../models/pixel'

const Pixel = (props: { coordinates: Coordinates, pixel: Pixel }) => {
    const { pixel, coordinates } = props
    const { color } = pixel
    const { x, y } = coordinates

    const { selectedColor, socket } = useContext(AppContext)

    const { hovered, ref } = useHover()

    const size = 64

    const handleOnClick = () => {
        if (!selectedColor) return
        console.log("claimed pixel", x, y, selectedColor)
        socket?.emit(SocketEvents.CLAIM_PIXEL, { coordinates, pixel: { color: selectedColor } })
    }

    return (
        <div ref={ref}
            onMouseDown={() => handleOnClick()}
            style={{
                height: size, width: size,
                backgroundColor: color,
                border:"1px solid grey",

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