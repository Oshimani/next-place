import React, { useContext } from 'react'
import { Button, SimpleGrid, Text } from '@mantine/core'
import AppContext from '../contexts/AppContext'
import { IconCheck } from '@tabler/icons'

const ColorPalette = () => {

    const colors = ["black", "white", "red", "blue", "green", "yellow"]

    const { selectedColor, setSelectedColor } = useContext(AppContext)

    return (
        <div>
            <SimpleGrid cols={1}>
                <Text>Pick your color</Text>
                {colors.map(color =>
                    <Button onClick={() => setSelectedColor(color)} key={color}
                        variant={color === "white" ? "white" : "filled"}
                        color={color === "black" ? "dark" : color}>
                        {color === selectedColor &&
                            <IconCheck />
                        }
                    </Button>
                )}
            </SimpleGrid>
        </div>
    )
}

export default ColorPalette