interface ChipStackProps {
  amount: number
}

const ChipStack = ({ amount }: ChipStackProps) => {
  const chips = Math.floor(amount / 100)

  return (
    <div className="relative mt-1 flex flex-col items-center">
      <div className="relative h-4 w-10">
        {Array.from({ length: Math.min(chips, 5) }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 w-10 h-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-md"
            style={{ bottom: `${i * 3}px`, zIndex: i }}
          />
        ))}
      </div>
      <span className="text-xs text-green-300 font-semibold mt-1">${amount}</span>
    </div>
  )
}

export default ChipStack
