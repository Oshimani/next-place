import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link';

import { useSession, signIn } from 'next-auth/react'

import { AppShell, Button, Center, useMantineTheme } from '@mantine/core';

import AppHeader from '../components/Header';


const Home: NextPage = () => {
  const theme = useMantineTheme()
  const { data: session } = useSession()

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <AppShell
        header={<AppHeader />}
      >
        {session ?
          <Center>
            <Link href="/game">
              <Button>Play</Button>
            </Link>
          </Center>

          :

          <>
            <Center>
              <Button variant='filled' color="green" onClick={() => { signIn() }}>Sign in</Button>
            </Center>
          </>
        }
      </AppShell>
    </div>
  )
}

export default Home
