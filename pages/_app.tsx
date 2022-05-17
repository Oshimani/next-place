import Head from 'next/head'
import type { AppProps } from 'next/app'

import { SessionProvider } from "next-auth/react"

import { MantineProvider } from '@mantine/core'

import '../styles/globals.css'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider theme={{}}>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </MantineProvider>
    </>
  )
}

export default MyApp
