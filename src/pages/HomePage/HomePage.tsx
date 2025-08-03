import { ProgressBar } from '../../shared/ui/ProgressBar'

export const HomePage = () => {
  // Mock data - in a real app this would come from state management
  const currentDate = new Date()
  const lensDuration = 14 // 14 days lens wear period
  const halfDuration = lensDuration / 2

  // Set start date to 7 days ago (middle of period)
  const lensStartDate = new Date(
    currentDate.getTime() - halfDuration * 24 * 60 * 60 * 1000
  )
  // Set end date to 7 days from now
  const lensEndDate = new Date(
    currentDate.getTime() + halfDuration * 24 * 60 * 60 * 1000
  )

  // Calculate remaining time
  const totalDuration = lensEndDate.getTime() - lensStartDate.getTime()
  const elapsedTime = currentDate.getTime() - lensStartDate.getTime()
  const remainingTime = lensEndDate.getTime() - currentDate.getTime()

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(
    Math.max((elapsedTime / totalDuration) * 100, 0),
    100
  )

  // Calculate remaining days and hours
  const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
  const remainingHours = Math.floor(
    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )

  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Lens Remaining Period Block */}
      <div className="max-w-md">
        <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          {/* Top: Time remaining */}
          <div className="mb-4 text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {remainingDays}d {remainingHours}h
            </div>
          </div>

          {/* Middle: "Remaining" text */}
          <div className="mb-6 text-center">
            <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Remaining
            </div>
          </div>

          {/* Bottom: Progress bar with dates */}
          <ProgressBar
            percentage={progressPercentage}
            startLabel={formatDate(lensStartDate)}
            endLabel={formatDate(lensEndDate)}
          />
        </div>
      </div>
    </div>
  )
}
