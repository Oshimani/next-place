import React, { useContext } from 'react'

import Pixel from './Pixel'
import { IPixel } from '../models/field'
import AppContext from '../contexts/AppContext'

const Map = (props: { pixels: Array<IPixel> }) => {
    const { pixels } = props

const {fieldDimmensions} = useContext(AppContext)

    return (
        <div style={{ width: 'fit-content', display: 'grid', gridTemplateColumns: `repeat(${fieldDimmensions!.x}, 1fr)` }}>
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