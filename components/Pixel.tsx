import React, { useContext } from 'react'
import AppContext from '../contexts/AppContext'
import { SocketEvents } from '../models/events'
import { IPixel } from '../models/field'
import { IconCurrentLocation } from '@tabler/icons'

import styles from './Pixel.module.scss'

const Pixel = (props: { pixel: IPixel }) => {
    const { pixel } = props
    const { x, y, color } = pixel

    const { selectedColor, socket } = useContext(AppContext)

    const size = 64

    const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        /**
         * 0=left
         * 1=middle
         * 2=right
         */
        if (e.button !== 0) return
        if (pixel.color === selectedColor) return
        console.log("claimed pixel", x, y, selectedColor)
        socket?.emit(SocketEvents.CLAIM_PIXEL, { pixel: { ...pixel, color: selectedColor } })
    }

    return (
        <div
            onMouseDown={(e) => handleOnClick(e)}
            className={styles.pixel}
            style={{
                height: size, width: size,
                backgroundColor: color,
                border: "1px solid grey",
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
            }}
        >
            {/* Display  icon when hovered */}
            <IconCurrentLocation
                className={styles.icon}
                style={{
                    color: selectedColor
                }}
                size={size * 0.8} />
        </div >
    )
}

export default React.memo(Pixel)