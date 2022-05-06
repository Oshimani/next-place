import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';

import { Button, Center, Container, Space, Title } from '@mantine/core';


const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Center>
        <Title>Next-Place</Title>
      </Center>

      <Space h="lg" />

      <Center>
        <Link href="/game">Play</Link>
      </Center>

    </div>
  )
}

export default Home
