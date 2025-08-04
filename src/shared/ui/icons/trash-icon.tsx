import React from 'react'
import { SvgBase } from './svg-base'

interface TrashIconProps {
  className?: string
  width?: number | string
  height?: number | string
}

export const TrashIcon: React.FC<TrashIconProps> = ({
  className = '',
  width = 24,
  height = 24
}) => {
  return (
    <SvgBase
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
    >
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </SvgBase>
  )
}
