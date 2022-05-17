import type { NextPage } from 'next'

import { useSession } from 'next-auth/react';

import { AppShell, Card, Title, Text, Avatar } from '@mantine/core';

import NoAccess from '../components/NoAccess';
import ProfileNavbar from '../components/ProfileNavbar';
import AppHeader from '../components/Header';


const Profile: NextPage = () => {
    const { data: session } = useSession()

    return (
        <AppShell
            padding={64}
            header={<AppHeader />}
            navbar={<ProfileNavbar />}
        >
            {session ?
                <>
                    <Card px={32} py={16} shadow={'md'}>
                        <Card.Section px={32} py={16}>
                            <Avatar src={session.user?.image} radius="md" size={"xl"} />
                        </Card.Section>
                        <Card.Section px={32} py={16}>
                            <Title order={1}>{session.user?.name}</Title>
                            <Text>
                                {session.user?.email}
                            </Text>
                            <Text>
                                {session.user?.image}
                            </Text>
                        </Card.Section>
                    </Card>
                </>

                :

                <NoAccess />

            }
        </AppShell>
    )
}

export default Profile
