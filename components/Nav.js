import { Flex, Box, Container, Text, Link, Button, Spacer } from '@chakra-ui/react'
import NextLink from 'next/link.js'
import { BiPlusCircle } from 'react-icons/bi'
import { TbBrandDeno } from 'react-icons/tb';

export default function Nav() {
  return (<>
    <Box as="nav" bg="white" boxShadow="sm">
      <Container py={{ base: '2' }} maxW="6xl">
        <Flex gap={2} align="center">
          <Link color="primary.500" href="/" as={NextLink}>
            <TbBrandDeno fontSize="2em" />
          </Link>
          <Link color="primary.500" href="/" as={NextLink}>
            <Text fontSize="lg" fontWeight="bold">Redino.LOL</Text>
          </Link>
          <Spacer></Spacer>
          <Button
            variant="outline"
            leftIcon={<BiPlusCircle fontSize="1.4em" />}
          >បង្កើត Quotes</Button>
        </Flex>
      </Container>
    </Box>
  </>)
}