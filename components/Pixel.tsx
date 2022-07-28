import React, { useContext } from 'react'
import { useHover } from '@mantine/hooks'
import AppContext from '../contexts/AppContext'
import { SocketEvents } from '../models/events'
import { IPixel } from '../models/field'
import { IconCurrentLocation } from '@tabler/icons'

const Pixel = (props: { pixel: IPixel }) => {
    const { pixel } = props
    const { x, y, color } = pixel

    const { selectedColor, socket } = useContext(AppContext)

    const { hovered, ref } = useHover()

    const size = 64

    const handleOnClick = () => {
        if (pixel.color === selectedColor) return
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
                position: 'relative',
                transition: 'all 0.2s ease-in-out',

                // hovered and color is selected
                ...(hovered && selectedColor && {
                    cursor: 'pointer',
                    transform: 'scale(1.1)',
                    zIndex:10
                })
            }}
        >
            {/* Display  icon when hovered */}
            {hovered && <IconCurrentLocation
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: selectedColor!

                }}
                size={size * 0.8} />}
        </div >
    )
}

export default Pixel