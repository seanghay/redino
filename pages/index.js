import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'

export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);
  const [text, setText] = useState('ធ្វើរូបដើម្បីតែ\nគ្រួសារ\nទេបាទ');
  const [loading, setLoading] = useState(false);

  const onGenerate = useCallback(() => {
    setImageUrl(null);
    setLoading(true)
    const data = { text: text.split(/\n/) };
    setImageUrl(`/api/generate?data=${encodeURIComponent(JSON.stringify(data))}&t=${Date.now()}`)
  })

  useEffect(() => {
    onGenerate()
  }, [])

  const onLoad = (e) => {
    setLoading(false)
    console.log(e.target.src)
  }


  return (
    <>
      <Head>
        <title>Redino</title>
        <meta name="description" content="Redino" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              onLoad={() => setLoading(false)}
              key={imageUrl}
              src={imageUrl}
              alt="" />
          </div>
          }
        </div>
      </main>
    </>
  )
}
