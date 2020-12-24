// Composer\packages\client\src\shell\useShell.ts

import { useRecoilValue } from 'recoil';

import { designPageLocationState } from './botState';
import { zoomDispatcher } from './zoom';
import { rateInfoState } from './zoomState';

export function useShell() : any {
    const designPageLocation = useRecoilValue(designPageLocationState('dummy'));
    const flowZoomRate = useRecoilValue(rateInfoState);
    const { updateZoomRate } = zoomDispatcher();

    const { selected } = designPageLocation;

    function updateFlowZoomRate(currentRate) {
        updateZoomRate({ currentRate });
    }

    const api = {
        addCoachMarkRef: (ref) => {},
        updateFlowZoomRate,
    };

    const data = {
        focusedEvent: selected,
        flowZoomRate,
    };

    return {
        api,
        data
    };
}
