import Image from 'next/image'

interface Props {
  height?: number
  dark?: boolean
}

export default function LogoMark({ height = 75, dark = false }: Props) {
  return (
    <Image
      src="/images/logo.jpg"
      alt="Aspect Ratio"
      height={height}
      width={height * 1.4}  // AR.jpeg is roughly 4:3 landscape
      style={{
        height,
        width: 'auto',
        display: 'block',
        filter: dark ? 'invert(1)' : 'none',
      }}
    />
  )
}
