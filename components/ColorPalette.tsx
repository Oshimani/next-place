import React, { useContext } from 'react'
import { Button, SimpleGrid } from '@mantine/core'
import AppContext from '../contexts/AppContext'

const ColorPalette = () => {

    const colors = ["white", "black", "red", "blue", "green", "yellow"]

    const { selectedColor, setSelectedColor } = useContext(AppContext)

    return (
        <div>
            <SimpleGrid cols={1}>
                {colors.map(color =>
                    <Button onClick={() => setSelectedColor(color)} key={color}
                        variant={color === "white" ? "white" : "filled"}
                        color={color === "black" ? "dark" : color}>
                    </Button>
                )}
            </SimpleGrid>
        </div>
    )
}

export default ColorPalette