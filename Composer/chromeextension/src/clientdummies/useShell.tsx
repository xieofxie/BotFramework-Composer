// Composer\packages\client\src\shell\useShell.ts

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { PromptTab } from '@bfc/shared';

import { applicationDispatcher } from './application';
import { designPageLocationState, schemasState } from './botState';
import { editorDispatcher } from './editor';
import { zoomDispatcher } from './zoom';
import { rateInfoState } from './zoomState';

type EventSource = 'FlowEditor' | 'PropertyEditor' | 'DesignPage' | 'VaCreation';

export function useShell(source: EventSource, projectId: string, currentDialog: any): any {
    const schemas = useRecoilValue(schemasState(projectId));
    const designPageLocation = useRecoilValue(designPageLocationState(projectId));
    const setDesignPageLocation = useSetRecoilState(designPageLocationState(projectId));
    const flowZoomRate = useRecoilValue(rateInfoState);

    const { setVisualEditorSelection } = editorDispatcher();
    const { setMessage } = applicationDispatcher();
    const { updateZoomRate } = zoomDispatcher();

    const { dialogId, selected, focused, promptTab } = designPageLocation;

    async function focusSteps(subPaths: string[] = [], fragment?: string) {
        if (subPaths.length == 0) return;
        let dataPath: string = subPaths[0];
        // TODO special case
        if (dataPath.startsWith('..')) {
            dataPath = dataPath.substr(2);
        }
        setDesignPageLocation((old) => { return {
            ...old,
            focused: dataPath,
            promptTab: Object.values(PromptTab).find((value) => (fragment ?? '') === value),
        }});
        /*
        if (source === FORM_EDITOR) {
            // nothing focused yet, prepend the selected path
            if (!focused && selected) {
                dataPath = `${selected}.${dataPath}`;
            } else if (focused !== dataPath) {
                dataPath = `${focused}.${dataPath}`;
            }
        }
        // Composer\packages\client\src\recoilModel\dispatchers\navigation.ts
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
        schemas,
        currentDialog,
        focusedEvent: selected,
        flowZoomRate,
        focusedSteps: [focused],
        focusedTab: promptTab,
        forceDisabledActions: [],
    };

    return {
        api,
        data
    };
}
