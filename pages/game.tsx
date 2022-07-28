import type { NextPage } from 'next'
import { GetServerSideProps } from 'next';
import Link from 'next/link';

import { useState, useEffect } from 'react';

import { getSession, useSession } from 'next-auth/react'

import io, { Socket } from 'socket.io-client'

import { AppShell, Navbar, useMantineTheme, Center, Title } from '@mantine/core';

import Map from '../components/Map'
import ColorPalette from '../components/ColorPalette';

import { convertFieldToDbRecord, Coordinates, Field, IPixelRecord, parseFieldDbRecord } from '../models/field';
import { Pixel } from '../models/pixel';
import { SocketEvents } from '../models/events';

import AppContext from '../contexts/AppContext';

import { IUserLockResult } from '../lib/mongodb';
import NoAccess from '../components/NoAccess';
import AppHeader from '../components/Header';
import { Session } from 'next-auth';

let socket: Socket

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const session = await getSession(ctx)
    if (session) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/game`)
    }

    return {
        props: {
            session
        }
    }
}

const Game: NextPage<{ session: Session | null }> = (props) => {

    const theme = useMantineTheme()
    const { data: session } = useSession()

    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [fieldDimmensions, setFieldDimmensions] = useState({x: 0, y: 0})

    const [field, setField] = useState<Field | null>(null)

    const updateField = (coordinates: Coordinates, pixel: Pixel, field: Field) => {

        if (field) {
            field. set(coordinates, pixel)
            console.log("update field", field, pixel);
            return parseFieldDbRecord(convertFieldToDbRecord(field))
        }
        return null
    }

    const initializeSocket = async () => {
        socket = io()

        socket.on(SocketEvents.CONNECT, () => {
            console.log("connected", socket.id)
        })

        socket.on(SocketEvents.JOIN, (args: { fieldDimmensions: { x: number, y: number }, pixels: Array<IPixelRecord> }) => {
            const { pixels, fieldDimmensions } = args
            const parsedField = parseFieldDbRecord(pixels)
            console.log("joined", parsedField)
            setField(parsedField)
            setFieldDimmensions(fieldDimmensions)
        })

        socket.on(SocketEvents.UPDATE_PIXEL, (args: { coordinates: Coordinates, pixel: Pixel }) => {
            const { coordinates, pixel } = args
            console.log("Pixel updated from server", coordinates, pixel)
            // prevent stale closure
            setField((prefField) => (updateField(coordinates, pixel, prefField!)))
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
        if (props.session)
            initializeSocket()
        return () => disconnectSocket()
    }, [])


    return (
        <AppContext.Provider value={{ selectedColor, setSelectedColor, socket }}>

            <AppShell padding={0}
                header={<AppHeader />}
                navbar={
                    <Navbar sx={{ backgroundColor: theme.colors.dark[0] }}
                        width={{ base: 300, sm: 100 }}
                        p="md">
                        <ColorPalette />
                    </Navbar>
                }>

                {props.session ?
                    <>
                        {/* FIELD */}
                        {field && fieldDimmensions ?
                            <Map field={field} fieldDimmensions={fieldDimmensions} />
                            :
                            <div>Loading Field</div>
                        }
                    </>

                    :

                    <NoAccess />
                }
            </AppShell>

        </AppContext.Provider>
    );
}

export default Game;