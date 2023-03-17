import { families } from '@/src/fonts.js'
import {
  AspectRatio, Button, ButtonGroup, Card, Center, FormControl,
  FormLabel, HStack, Image, Input, Select,
  Slider, SliderFilledTrack,
  SliderThumb, SliderTrack, Spacer, Stack, Text, Textarea,
  Box
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { AiOutlineCloudDownload, AiOutlineLink } from 'react-icons/ai'
import { ImMagicWand } from 'react-icons/im'
import NextLink from 'next/link.js'

function ImagePlaceholder() {
  return <Box bg="blackAlpha.50">
    <Center>
      <Text>មិនទាន់មានរូប</Text>
    </Center>
  </Box>
}


export default function CreatorForm({ id }) {

  const [text, setText] = useState("សរសេរតាម\nចិត្តរបស់អ្នក")
  const [keyword, setKeyword] = useState("")
  const [font, setFont] = useState("");
  const [maxFontSize, setMaxFontSize] = useState(90);
  const [maxWidthScale, setMaxWidthScale] = useState(80)
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState(id)
  const imageUrl = imageId ? `/api/image/${imageId}`: null;

  const generate = useCallback(async () => {
    setLoading(true);

    const option = {
      text: text.split('\n'),
      "font": font,
      "bg": keyword,
      "maxFontSize": maxFontSize,
      "maxWidthScale": maxWidthScale / 100
    };

    const res = await fetch("/api/create", {
      body: JSON.stringify(option),
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const { id } = await res.json();
    setImageId(id);
    setLoading(false);
  });

  return (<>
    <Stack p={4}>
      <Stack gap={2}>
        <FormControl>
          <FormLabel>សរសេរតាមចិត្តរបស់អ្នក</FormLabel>
          <Textarea
            variant="filled"
            focusBorderColor="primary.500"
            resize="none"
            fontWeight="semibold"
            fontSize="xl"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder='សរសេរ Quote របស់អ្នកនៅទីនេះ' type='text' />
        </FormControl>

        <Stack gap={2} direction="row">
          <FormControl>
            <FormLabel>ពុម្ពអក្សរ</FormLabel>
            <Select onChange={e => setFont(e.target.value)} value={font} focusBorderColor="primary.500" fontWeight="medium" placeholder='(ចៃដន្យ)'>
              {families.map(it => <option key={it} value={it}>{it}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>ពាក្យគន្លឹះ</FormLabel>
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              focusBorderColor="primary.500" fontWeight="medium" placeholder='success, business, growth' />
          </FormControl>
        </Stack>

        <Stack gap={2} direction="row">
          <FormControl>
            <FormLabel>ទំហំពុម្ពអក្សរ ({maxFontSize}px)</FormLabel>
            <Slider min={70} max={120} colorScheme="primary" aria-label='slider-ex-1' value={maxFontSize} onChange={v => setMaxFontSize(v)}>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
          <FormControl>
            <FormLabel>មាត្រដ្ឋានទទឹង ({maxWidthScale / 100})</FormLabel>
            <Slider min={0} max={100} colorScheme="primary" aria-label='slider-ex-1' value={maxWidthScale} onChange={v => setMaxWidthScale(v)}>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
        </Stack>
        <Center>
          <Button onClick={generate} isLoading={loading} colorScheme="primary" leftIcon={<ImMagicWand />}>
            បង្កើតរូបភាព
          </Button>
        </Center>
      </Stack>
      <HStack py={2}>
        <Text fontWeight="bold" fontSize="2xl">លទ្ធផលរូបភាព</Text>
        <Spacer></Spacer>
        <ButtonGroup>
          {imageId && <Button as={NextLink} href={`/${imageId}`} isDisabled={id || !imageId} variant="outline" size="sm" leftIcon={<AiOutlineLink fontSize="1.2em" />}>ចែករំលែក</Button>}
          <Button isDisabled variant="outline" size="sm" leftIcon={<AiOutlineCloudDownload fontSize="1.2em" />}>ទាញយក</Button>
        </ButtonGroup>
      </HStack>
      
      <Card variant="outline">
        <AspectRatio ratio={1}>
          {imageUrl ? <Image src={imageUrl} alt={text} /> : <ImagePlaceholder/>}
        </AspectRatio>
      </Card>

    </Stack>
  </>)
}