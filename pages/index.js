import Head from 'next/head'
import { useRouter } from 'next/router.js';
import { useCallback, useEffect, useState } from 'react'

export async function getServerSideProps(context) {
  return {
    props: {
      data: context.query.data || "សួស្ដី\nមនុស្ស",
    }
  }
}

export default function Home(props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);
  const [text, setText] = useState(props.data);
  const [loading, setLoading] = useState(false);
  const ogTitle = text.replace(/\n/g, ' ');

  const ogImageData = {
    og: 1,
    text: text.split(/\n/),
  }

  const ogImage = `https://redino.vercel.app/api/generate?data=${encodeURIComponent(JSON.stringify(ogImageData))}`;
  const ogUrl = "https://redino.vercel.app/?data=" + encodeURIComponent(props.data);

  const onGenerate = useCallback(() => {
    setImageUrl(null);
    setLoading(true)
    
    const data = { text: text.split(/\n/) };
    setImageUrl(`/api/generate?data=${encodeURIComponent(JSON.stringify(data))}&t=${Date.now()}`)
   
    router.replace({
      query: {
        data: text,
      }
    })
    
  })

  useEffect(() => {
    onGenerate()
  }, [])

  const onLoad = (e) => {
    setLoading(false)
    console.log(e.target.src)
  }

  const onImageLoaded = (e) => {
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>{ogTitle} / Redino</title>
        <meta name="description" content={ogTitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content="Redino" />
        <meta property="og:image" content={ogImage} />
        <link rel="icon" href="/favicon.ico" />

      </Head>
      <main className='flex-column'>
        <h3>🦖 Redino Generator</h3>
        <textarea type="text" value={text} onChange={e => setText(e.currentTarget.value)} />
        <button className='button' disabled={loading} onClick={onGenerate}>
          {loading ? 'Loading…' : 'Generate'}
        </button>
        <div>
          {imageUrl && <div>
            <blockquote>ℹ️ Save the image by right clicking on it and do not open the image in new tab!</blockquote>
            <img
              onError={() => setLoading(false)}
              onLoad={onImageLoaded}
              key={imageUrl}
              src={imageUrl}
              alt="" />
          </div>
          }
        </div>
        <a href='https://github.com/seanghay/redino' target="_blank"><strong><small>View on GitHub</small></strong></a>
      </main>
    </>
  )
}
