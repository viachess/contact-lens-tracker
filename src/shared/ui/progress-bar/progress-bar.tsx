interface ProgressBarProps {
  percentage: number;
  startLabel: string;
  endLabel: string;
  className?: string;
}

export const ProgressBar = ({
  percentage,
  startLabel,
  endLabel,
  className = ''
}: ProgressBarProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">{startLabel}</span>
        <span className="text-red-500 dark:text-red-400">{endLabel}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};
