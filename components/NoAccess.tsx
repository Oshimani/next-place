import React from 'react'

import { Button, Center, Text } from '@mantine/core'

import { signIn } from 'next-auth/react'

const NoAccess = () => {

    return (
        <>
            <Center sx={{ display: 'flex', flexDirection: 'column' }}>
                <Text>You do not have access to this page.</Text>
                <Text>Sign in to access it</Text>
                <Button variant='filled' onClick={() => signIn()}>Sign in</Button>
            </Center>
        </>
    )
}

export default NoAccess