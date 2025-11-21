'use client';

import React, { FC, ReactNode, useEffect } from 'react';
import { Portal } from './portal-modal';
import { PortalTypeEnum } from './types';
import { closeModal } from '@/app/store/slices/modal-slice/slice';
import { selectOpenedModal } from '@/app/store/slices/modal-slice/selectors';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

interface ModalContainerProps {
  bgColor?: string;
  opacity?: number;
  padding?: string;
  type?: PortalTypeEnum;
  zIndex?: number;
  isFullScreen?: boolean;
  children: ReactNode;
  name?: string;
}

export const ModalContainer: FC<ModalContainerProps> = (props) => {
  const {
    children,
    bgColor,
    opacity,
    padding,
    zIndex,
    type = PortalTypeEnum.MODAL,
    name,
    isFullScreen = true
  } = props;

  const openedModal = useAppSelector(selectOpenedModal);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        type === PortalTypeEnum.MODAL &&
        name === openedModal
      ) {
        dispatch(closeModal());
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, name, openedModal, dispatch]);

  if (type === PortalTypeEnum.MODAL) {
    return name === openedModal ? (
      <Portal
        bgColor={bgColor}
        padding={padding}
        opacity={opacity}
        zIndex={zIndex}
        isFullScreen={isFullScreen}
      >
        {children}
      </Portal>
    ) : null;
  }
  // context menu mode
  return (
    <Portal type={PortalTypeEnum.CONTEXT} zIndex={zIndex ?? 0}>
      {children}
    </Portal>
  );
};
