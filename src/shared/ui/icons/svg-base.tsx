import React from 'react'

interface SvgBaseProps {
  children: React.ReactNode
  className?: string
  width?: number | string
  height?: number | string
  viewBox?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export const SvgBase: React.FC<SvgBaseProps> = ({
  children,
  className = '',
  width = 24,
  height = 24,
  viewBox = '0 0 24 24',
  fill = 'currentColor',
  stroke = 'none',
  strokeWidth = 1
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}
