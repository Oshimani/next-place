import type { NextPage } from 'next'
import Link from 'next/link';
import { GetServerSideProps } from 'next';

import { useState, useEffect } from 'react';

import io, { Socket } from 'socket.io-client'

import { AppShell, Navbar, useMantineTheme, Center, Title } from '@mantine/core';

import Map from '../components/Map'
import ColorPalette from '../components/ColorPalette';

import { Field } from '../models/field';
import { Pixel } from '../models/pixel';
import { SocketEvents } from '../models/events';

import AppContext from '../contexts/AppContext';

import { IUserLockResult } from '../lib/mongodb';

let socket: Socket


export const getServerSideProps: GetServerSideProps = async (ctx) => {

    await fetch(`${process.env.NEXTAUTH_URL}/api/game`)
    return {
        props: {
            data: null
        }
    }
}

const Game: NextPage = () => {

    const theme = useMantineTheme()

    const [selectedColor, setSelectedColor] = useState<string | null>(null)

    const [field, setField] = useState<Field | null>(null)

    const updateField = (pixel: Pixel, field: Field) => {

        if (field) {
            const { x, y, color } = pixel
            field[y][x].color = color
            console.log("update field", field, pixel);
            return [...field]
        }
        return null
    }

    const initializeSocket = async () => {
        socket = io()

        socket.on(SocketEvents.CONNECT, () => {
            console.log("connected", socket.id)
        })

        socket.on(SocketEvents.JOIN, (newField) => {
            console.log("joined", newField)
            setField(newField)
        })

        socket.on(SocketEvents.UPDATE_PIXEL, (pixel) => {
            console.log("Pixel updated from server", pixel)
            // prevent stale closure
            setField((prefField) => (updateField(pixel, prefField!)))
        })

        socket.on(SocketEvents.CLAIM_PIXEL_FAILED, (response: { remainingTimeout: number }) => {
            console.log(`You may not claim another pixel yet for another ${response.remainingTimeout} seconds`)
        })

        socket.on(SocketEvents.NEW_USER, (userId) => {
            console.log(`${userId} joined the game`)
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