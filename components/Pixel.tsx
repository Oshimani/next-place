import { useHover } from '@mantine/hooks'
import React, { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import { SocketEvents } from '../models/events'
import { Pixel } from '../models/pixel'

const Pixel = (props: { pixel: Pixel }) => {
    const { color, x, y } = props.pixel

    const { selectedColor, socket } = useContext(AppContext)

    const { hovered, ref } = useHover()

    const size = 16

    const handleOnClick = () => {
        if (!selectedColor) return
        console.log("claimed pixel", x, y, selectedColor)
        socket?.emit(SocketEvents.CLAIM_PIXEL, { x, y, color: selectedColor })
    }

    return (
        <div ref={ref}
            onMouseDown={() => handleOnClick()}
            style={{
                height: size, width: size,
                backgroundColor: color,

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