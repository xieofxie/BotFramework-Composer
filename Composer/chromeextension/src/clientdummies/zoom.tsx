/* eslint-disable react-hooks/rules-of-hooks */
// Composer\packages\client\src\recoilModel\dispatchers\zoom.ts

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { rateInfoState } from './zoomState';

export const zoomDispatcher = () => {
  const updateZoomRate = useRecoilCallback(({ set }: CallbackInterface) => async ({ currentRate }) => {
    set(rateInfoState, (rateInfo) => {
      return { ...rateInfo, currentRate };
    });
  });
  return {
    updateZoomRate,
  };
};
