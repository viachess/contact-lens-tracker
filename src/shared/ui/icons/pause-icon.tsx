import React from 'react';
import { SvgBase } from './svg-base';

interface PauseIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const PauseIcon: React.FC<PauseIconProps> = ({
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
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </SvgBase>
  );
};
