import React from 'react'

import { signIn, signOut, useSession } from 'next-auth/react'

import { Button, Avatar, Group, Text, Title, Center, useMantineTheme, Header, Grid } from '@mantine/core'
import Link from 'next/link'

const AppHeader = () => {
    const { data: session } = useSession()
    const theme = useMantineTheme()

    return (
        <Header height={80} sx={{ backgroundColor: theme.primaryColor, color: theme.white }}>
            <Grid p={16}>
                <Grid.Col span={4}></Grid.Col>

                <Grid.Col span={4}>
                    <Center>
                        <Link href={"/"}>
                            <Title>Next-Place</Title>
                        </Link>
                    </Center>
                </Grid.Col>

                <Grid.Col span={4}>
                    {session ?

                        // IS AUTHENTICATED
                        <Group position='right'>
                            <Link href="/profile">
                                <div style={{ display: 'flex', flexDirection: "row", gap: 4 }}>
                                    <Avatar src={session.user?.image} radius="sm" size={"sm"} />
                                    <Text>{session.user?.name}</Text>
                                </div>
                            </Link>
                            <Button variant='filled' color={"red"} onClick={() => signOut()}>Sign out</Button>
                        </Group>

                        :

                        // IS NOT AUTHENTICATED
                        <Group position='right'>
                            <Button variant='filled' color='green' onClick={() => signIn()}>Sign in</Button>
                        </Group>
                    }
                </Grid.Col>
            </Grid>
        </Header>
    )
}

export default AppHeader