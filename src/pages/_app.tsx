import { AppProps } from 'next/app';
import Head from 'next/head';
import 'tailwindcss/tailwind.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>OrderCloud Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;