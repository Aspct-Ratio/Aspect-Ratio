interface Props {
  height?: number
  dark?: boolean
}

export default function LogoMark({ height = 40, dark = false }: Props) {
  const color = dark ? '#ffffff' : '#111827'
  const stroke = 2.5

  return (
    <svg
      height={height}
      viewBox="0 0 128 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Top-left L bracket */}
      <polyline
        points="14,2 2,2 2,14"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />

      {/* Bottom-right L bracket */}
      <polyline
        points="114,46 126,46 126,34"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="square"
      />

      {/* ASPCT — centered between brackets */}
      <text
        x="64"
        y="19"
        textAnchor="middle"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="4"
        fill={color}
      >ASPCT</text>

      {/* RATIO — centered under ASPCT */}
      <text
        x="64"
        y="37"
        textAnchor="middle"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="4"
        fill={color}
      >RATIO</text>
    </svg>
  )
}
