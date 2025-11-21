import React from 'react';
import { SvgBase } from './svg-base';

interface StopSignIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const StopSignIcon: React.FC<StopSignIconProps> = ({
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
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgBase>
  );
};
