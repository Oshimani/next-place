import React from 'react'
import { Grid, Paper } from '@mantine/core'

import Pixel from './Pixel'
import { Field } from '../models/field'

const Map = (props: { field: Field, fieldDimmensions: { x: number, y: number } }) => {
    const { field,fieldDimmensions } = props
    return (
        <div style={{ width: 'fit-content', display: 'grid', gridTemplateColumns: `repeat(${fieldDimmensions.x}, 1fr)` }}>
            {/* <Grid columns={64}> */}
            {Array.from(field.entries()).map(entry => {
                const [coordinates, pixel] = entry
                return <Pixel key={`x${coordinates.x}y${coordinates.y}`} coordinates={coordinates} pixel={pixel} />
            }
            )}
            {/* </Grid> */}
        </div>
    )
}

export default Map