// Composer\packages\client\src\shell\useShell.ts

import { useRecoilValue } from 'recoil';

import { applicationDispatcher } from './application';
import { designPageLocationState } from './botState';
import { editorDispatcher } from './editor';
import { zoomDispatcher } from './zoom';
import { rateInfoState } from './zoomState';

export function useShell(): any {
    const projectId = 'dummyProjectId';
    const designPageLocation = useRecoilValue(designPageLocationState(projectId));
    const flowZoomRate = useRecoilValue(rateInfoState);

    const { setVisualEditorSelection } = editorDispatcher();
    const { setMessage } = applicationDispatcher();
    const { updateZoomRate } = zoomDispatcher();

    const { selected } = designPageLocation;

    async function focusSteps(subPaths: string[] = [], fragment?: string) {
        let dataPath: string = subPaths[0];
        /*
        if (source === FORM_EDITOR) {
            // nothing focused yet, prepend the selected path
            if (!focused && selected) {
                dataPath = `${selected}.${dataPath}`;
            } else if (focused !== dataPath) {
                dataPath = `${focused}.${dataPath}`;
            }
        }
        await focusTo(rootBotProjectId ?? projectId, projectId, dataPath, fragment ?? '');
        */
    }

    function updateFlowZoomRate(currentRate) {
        updateZoomRate({ currentRate });
    }

    const api = {
        onFocusSteps: focusSteps,
        onSelect: setVisualEditorSelection,
        updateFlowZoomRate,
        addCoachMarkRef: (ref) => { },
        announce: setMessage,
    };

    const data = {
        projectId,
        focusedEvent: selected,
        flowZoomRate,
    };

    return {
        api,
        data
    };
}
