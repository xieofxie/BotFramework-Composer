// Composer\packages\client\src\recoilModel\atoms\appState.ts

import { atom } from 'recoil';

const getFullyQualifiedKey = (value: string) => {
    return `App_${value}_State`;
};

export const visualEditorSelectionState = atom<string[]>({
    key: getFullyQualifiedKey('visualEditorSelection'),
    default: [],
});

export const announcementState = atom<string>({
    key: getFullyQualifiedKey('announcement'),
    default: '',
});
