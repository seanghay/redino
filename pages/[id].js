import CreatorForm from "@/components/CreatorForm.js"
import Head from "next/head.js";

export async function getServerSideProps({ params }) {
  return {
    props: {
      id: params.id
    }
  }
}

export default function RenderPage({ id }) {

  const ogTitle = id;
  const ogImage = `https://redino.lol/api/image/og/${id}`;
  const ogUrl = `https://redino.lol/${id}`;

  return <>
    <Head>
      <title>{ogTitle} / Redino</title>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
      <meta name="description" content={ogTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content="Redino" />
      <meta property="og:image" content={ogImage} />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <CreatorForm id={id}></CreatorForm>
  </>
}