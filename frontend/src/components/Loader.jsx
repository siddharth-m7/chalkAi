import { useEffect, useState } from 'react'

const Loader = ({ authLoading }) => {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const steps = [
      [100, 15],
      [200, 30],
      [300, 45],
      [450, 60],
      [550, 75],
      [650, 88],
      [800, 100],
    ]
    const timers = steps.map(([delay, value]) =>
      setTimeout(() => setProgress(value), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!authLoading && progress === 100) {
      const timer = setTimeout(() => setVisible(false), 600)
      return () => clearTimeout(timer)
    }
  }, [authLoading, progress])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500"
      style={{ opacity: !authLoading && progress === 100 ? 0 : 1 }}
    >
      <h1 className="text-6xl font-extrabold text-black tracking-tight mb-8 select-none">
        Chalk<span className="text-[#FF5841]">AI</span>
      </h1>
      <div className="w-72 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF5841] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default Loader
