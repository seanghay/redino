import { Box, Container, Divider, Text, Link, Center } from "@chakra-ui/react";
import NextLink from 'next/link.js'
import { TbBrandDeno } from 'react-icons/tb';

export default function Footer() {
  return (
    <>
      <Divider />
      <Box my={2} pb={6}>
        <Container alignItems="center" textAlign="center" maxW="6xl">
          <Center color="gray.500" pb={1}>
            <TbBrandDeno fontSize="1.6em" />
          </Center>
          <Text textColor="gray.500" fontSize="sm" fontWeight="medium">Made by <Link isExternal as={NextLink} href="https://seanghay.com/">@seanghay</Link></Text>
          <Text textColor="gray.500" fontSize="xs" fontWeight="medium">The project is fully open-source on <Link isExternal as={NextLink} href="https://github.com/seanghay/redino">GitHub</Link></Text>
        </Container>
      </Box>
    </>
  )
}