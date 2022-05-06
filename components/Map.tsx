import React from 'react'
import { Grid, Paper } from '@mantine/core'

import Pixel from './Pixel'
import { Field } from '../models/field'

const Map = (props: { field: Field }) => {
    const { field } = props
    return (
        <Paper shadow={'xs'} radius={'xs'} p={'xs'}>
            <div style={{ width: 'fit-content', display: 'grid', gridTemplateColumns: `repeat(${64}, 1fr)` }}>
                {/* <Grid columns={64}> */}
                {field.map(row =>
                    row.map(pixel => <Pixel key={`x${pixel.x}y${pixel.y}`} pixel={pixel} />)
                )}
                {/* </Grid> */}
            </div>
        </Paper>
    )
}

export default Map