import { useEffect, useState } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) return null

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-lg bg-card">
              <span className="text-2xl md:text-4xl font-bold font-mono text-foreground">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-2 text-xs md:text-sm uppercase tracking-wider text-muted-foreground">{unit.label}</span>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-2xl md:text-4xl font-bold text-muted-foreground mb-6">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
