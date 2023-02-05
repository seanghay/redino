# 🦖 [redino](https://redino.vercel.app)

An open source motivational qoutes generator

## How it works

- Background images are randomly generated from [`https://source.unsplash.com/`](https://source.unsplash.com/)
- Render offscreen on the server using [`@napi-rs/canvas`](https://github.com/@napi-rs/canvas)
- Use Vercel serverless function to render the image.
- Emoji & custom fonts are preloaded.

## Preview

<img src="https://redino.vercel.app/api/generate?data=%7B%22text%22%3A%5B%22%E1%9E%92%E1%9F%92%E1%9E%9C%E1%9E%BE%E1%9E%80%E1%9E%B6%E1%9E%9A%E1%9E%8A%E1%9E%BE%E1%9E%98%E1%9F%92%E1%9E%94%E1%9E%B8%E1%9E%8F%E1%9F%82%22%2C%22%E1%9E%82%E1%9F%92%E1%9E%9A%E1%9E%BD%E1%9E%9F%E1%9E%B6%E1%9E%9A%E1%9E%91%E1%9F%81%22%5D%7D&t=1675566388849" width=512>
<img src=https://user-images.githubusercontent.com/15277233/216799229-a0113aed-a1c6-4065-843d-11e824e59d5a.png width=512>


## API

An example usage of the image generator API.

```js
const data = {
  text: ["Text line 1", "Text line 2"]
}

const imageUrl = `https://redino.vercel.app/api/generate?data=${encodeURIComponent(JSON.stringify(data))}`;
```

<img src="https://redino.vercel.app/api/generate?data=%7B%22text%22%3A%5B%22Text%20line%201%22%2C%22Text%20line%202%22%5D%7D" width=512>
