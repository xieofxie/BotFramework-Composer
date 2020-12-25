// Composer\packages\client\src\recoilModel\dispatchers\editor.ts

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { visualEditorSelectionState } from './appState';

export const editorDispatcher = () => {
    const setVisualEditorSelection = useRecoilCallback(({ set }: CallbackInterface) => (selection: string[]) => {
        set(visualEditorSelectionState, [...selection]);
    });

    const resetVisualEditor = useRecoilCallback(({ reset }: CallbackInterface) => () => {
        reset(visualEditorSelectionState);
    });

    return {
        resetVisualEditor,
        setVisualEditorSelection,
    };
};
