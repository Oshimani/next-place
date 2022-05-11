import type { NextPage } from 'next'
import Link from 'next/link';

import { useState, useEffect } from 'react';

import io, { Socket } from 'socket.io-client'

import { AppShell, Navbar, Header, useMantineTheme, Center, Title } from '@mantine/core';

import Map from '../components/Map'
import { Field } from '../models/field';
import { Pixel } from '../models/pixel';
import AppContext from '../contexts/AppContext';
import ColorPalette from '../components/ColorPalette';
import { SocketEvents } from '../models/events';

let socket: Socket

const Game: NextPage = () => {

    const theme = useMantineTheme()

    const [selectedColor, setSelectedColor] = useState<string | null>(null)

    const [field, setField] = useState<Field | null>(null)

    const updateField = (pixel: Pixel, field: Field) => {
        // console.log("update field", field, pixel);

        if (field) {
            const { x, y, color } = pixel
            field[y][x].color = color
            return field
        }
        return null
    }

    const initializeSocket = async () => {
        await fetch('/api/game')

        socket = io({
            reconnectionDelayMax: 10000, closeOnBeforeunload: true,
        })

        socket.on(SocketEvents.CONNECT, () => {
            console.log("connected", socket.id)
        })

        socket.on(SocketEvents.JOIN, (newField) => {
            console.log("joined", newField)
            setField([...newField])
        })


        // todo maybe move this to map component
        socket.on(SocketEvents.UPDATE_PIXEL, (pixel) => {
            console.log("Pixel updated from server", pixel)
            // prevent stale closure
            setField((prefField) => (updateField(pixel, prefField!)))
        })
    }

    const disconnectSocket = () => {
        socket?.disconnect()
    }

    useEffect(() => {
        initializeSocket()
        return () => disconnectSocket()
    }, [])


    return (
        <AppContext.Provider value={{ selectedColor, setSelectedColor, socket }}>

            <AppShell padding={0}
                header={
                    <Center pt='lg' pb='sm' sx={{ backgroundColor: theme.primaryColor, color: theme.white }}>
                        <Link href="/"><Title sx={{ cursor: "pointer" }}>Next-Place</Title></Link>
                    </Center>
                }
                navbar={
                    <Navbar sx={{ backgroundColor: theme.colors.dark[0] }}
                        width={{ base: 300, sm: 100 }}
                        p="md">
                        <ColorPalette />
                    </Navbar>
                }>
                <>
                    {field ?
                        <Map field={field} />
                        :
                        <div>Loading Field</div>
                    }
                </>
            </AppShell>

        </AppContext.Provider>
    );
}

export default Game;