import { useMemo, useState } from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { selectAllLenses } from '@/app/store/slices/lens-management-slice/selectors'
import Select from 'react-select'
import {
  XYChart,
  AnimatedBarSeries,
  AnimatedAxis,
  Tooltip
} from '@visx/xychart'

type Timeframe = '1D' | '1M' | '1Y'

type BarDatum = {
  x: string
  y: number
}

const chartTheme = {
  backgroundColor: 'transparent',
  colors: ['#0ea5e9'],
  gridColor: '#e5e7eb'
}

function generateMockData(timeframe: Timeframe): BarDatum[] {
  const now = new Date()
  if (timeframe === '1D') {
    return Array.from({ length: 24 }, (_, i) => {
      const label = `${i}`.padStart(2, '0')
      return {
        x: label,
        y: Math.max(0, Math.round(6 * Math.sin((i / 24) * Math.PI) + 4))
      }
    })
  }
  if (timeframe === '1M') {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (29 - i))
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      return { x: label, y: Math.max(0, Math.round(4 + 3 * Math.sin(i / 6))) }
    })
  }
  // 1Y
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(now.getMonth() - (11 - i))
    const label = d.toLocaleString(undefined, { month: 'short' })
    return { x: label, y: Math.max(0, Math.round(60 + 20 * Math.sin(i / 2))) }
  })
}

export const DataPage = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const lenses = useAppSelector(selectAllLenses)
  const [selectedLensIds, setSelectedLensIds] = useState<string[]>([])

  const data = useMemo(() => generateMockData(timeframe), [timeframe])

  const xAccessor = (d: BarDatum) => d.x
  const yAccessor = (d: BarDatum) => d.y

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Usage analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bar chart of lens usage over time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Lenses
          </label>
          <div className="min-w-[260px]">
            <Select
              isMulti
              classNamePrefix="lens-select"
              options={lenses.map((l) => ({
                value: l.id,
                label: `${l.brand} • ${l.manufacturer} • ${l.wearPeriodTitle}`
              }))}
              value={
                selectedLensIds
                  .map((id) => {
                    const l = lenses.find((x) => x.id === id)
                    return l
                      ? {
                          value: l.id,
                          label: `${l.brand} • ${l.manufacturer} • ${l.wearPeriodTitle}`
                        }
                      : null
                  })
                  .filter(Boolean) as { value: string; label: string }[]
              }
              onChange={(vals) => setSelectedLensIds(vals.map((v) => v.value))}
              placeholder="All lenses"
              styles={{
                control: (base) => ({ ...base, minHeight: 36 }),
                valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
                multiValue: (base) => ({ ...base, backgroundColor: '#e2f7e6' }),
                multiValueLabel: (base) => ({ ...base, color: '#065f46' }),
                multiValueRemove: (base) => ({ ...base, color: '#065f46' })
              }}
            />
          </div>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {(['1D', '1M', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={
                  'px-3 py-1 text-sm font-medium border first:rounded-l-md last:rounded-r-md ' +
                  (timeframe === tf
                    ? 'bg-sky-500 text-white border-sky-600'
                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-gray-300')
                }
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="h-[380px] w-full">
          <XYChart
            height={360}
            xScale={{ type: 'band', paddingInner: 0.25, paddingOuter: 0.1 }}
            yScale={{ type: 'linear' }}
          >
            <AnimatedAxis
              orientation="bottom"
              hideTicks={data.length > 30}
              tickLabelProps={() => ({ fontSize: 13 })}
            />
            <AnimatedAxis
              orientation="left"
              numTicks={5}
              tickLabelProps={() => ({ fontSize: 13 })}
            />
            <AnimatedBarSeries
              dataKey="usage"
              data={data}
              xAccessor={xAccessor}
              yAccessor={yAccessor}
              colorAccessor={() => '#86efac'}
            />
            <Tooltip<BarDatum>
              snapTooltipToDatumX
              snapTooltipToDatumY
              showVerticalCrosshair
              renderTooltip={({ tooltipData }) => {
                const d = tooltipData?.nearestDatum?.datum as
                  | BarDatum
                  | undefined
                if (!d) return null
                return (
                  <div className="rounded-lg border border-emerald-200 bg-white p-2 text-sm shadow-md dark:border-emerald-900/40 dark:bg-gray-900 dark:text-gray-100">
                    <div className="mb-0.5 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {timeframe === '1D'
                        ? 'Hour'
                        : timeframe === '1M'
                          ? 'Day'
                          : 'Month'}
                    </div>
                    <div className="font-semibold">{d.x}</div>
                    <div className="mt-1 text-emerald-600">
                      <span className="font-semibold">{d.y}</span> uses
                    </div>
                  </div>
                )
              }}
            />
          </XYChart>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Data shown is a placeholder. It will be replaced by your Supabase
        analytics once available.
      </div>
    </div>
  )
}
