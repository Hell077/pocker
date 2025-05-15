import gold from '/chips/gold.svg'
import purple from '/chips/purpule.svg'
import black from '/chips/black.svg'
import green from '/chips/green.svg'
import blue from '/chips/blue.svg'
import red from '/chips/red.svg'

interface Chip {
  color: string
  value: number
  img: string
}

const chips: Chip[] = [
  { color: 'gold', value: 1000, img: gold },
  { color: 'purple', value: 500, img: purple },
  { color: 'black', value: 100, img: black },
  { color: 'green', value: 25, img: green },
  { color: 'blue', value: 10, img: blue },
  { color: 'red', value: 5, img: red },
]

export default function ChipStack({ amount }: { amount: number }) {
  const stack: { img: string; key: string }[] = []
  let remaining = amount
  for (const chip of chips) {
    const count = Math.floor(remaining / chip.value)
    for (let i = 0; i < count; i++) {
      stack.push({ img: chip.img, key: chip.color + '-' + i })
    }
    remaining %= chip.value
  }

  return (
      <div className="relative w-10 h-[60px]">
        {stack.map((chip, index) => (
            <img
                key={chip.key}
                src={chip.img}
                alt=""
                className="absolute left-0 w-10 h-10"
                style={{ bottom: index * 4 }}
            />
        ))}
      </div>
  )
}
