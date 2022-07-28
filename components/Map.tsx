import React from 'react'
import { Grid, Paper } from '@mantine/core'

import Pixel from './Pixel'
import { IPixel } from '../models/field'

const Map = (props: { pixels: Array<IPixel>, fieldDimmensions: { x: number, y: number } }) => {
    const { pixels, fieldDimmensions } = props
    return (
        <div style={{ width: 'fit-content', display: 'grid', gridTemplateColumns: `repeat(${fieldDimmensions.x}, 1fr)` }}>
            {/* <Grid columns={64}> */}
            {pixels.map(pixel => {
                return <Pixel key={`x${pixel.x}y${pixel.y}`} pixel={pixel} />
            }
            )}
            {/* </Grid> */}
        </div>
    )
}

export default Map