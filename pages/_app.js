import { ChakraProvider, Container } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'
import '@fontsource/kantumruy-pro/variable.css'
import '@fontsource/kantumruy-pro/variable-italic.css'
import Nav from '@/components/Nav.js'
import Footer from '@/components/Footer.js'

const theme = extendTheme({

  fonts: {
    heading: `'Kantumruy Pro', sans-serif`,
    body: `'Kantumruy Pro', sans-serif`,
  },
  colors: {
    primary: {
      "50": "#fef5f5",
      "100": "#fdd7d7",
      "200": "#fab4b4",
      "300": "#f78484",
      "400": "#f56565",
      "500": "#de4747",
      "600": "#bc3c3c",
      "700": "#973030",
      "800": "#802929",
      "900": "#5d1e1e"
    }
  }

})
function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Nav></Nav>
      <Container maxW="6xl">
        <Component {...pageProps} />
      </Container>
      <Footer/>
    </ChakraProvider>
  )
}

export default MyApp