import CreatorForm from "@/components/CreatorForm.js"
import Head from "next/head.js";

export default function HomePage() {

  const ogTitle = "Redino";
  const ogUrl = `https://redino.lol/`;

  return (<>
    <Head>
      <title>{ogTitle} / Redino</title>
      <meta name="description" content={ogTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content="Redino" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <CreatorForm></CreatorForm>
  </>)
}