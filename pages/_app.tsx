import '../styles/tailwind.css';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>&nbsp;</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(CustomApp), {
  ssr: false,
});
