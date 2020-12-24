// Composer\packages\client\src\recoilModel\atoms\botState.ts

import { atomFamily } from 'recoil';

const getFullyQualifiedKey = (value: string) => {
    return `Bot_${value}_State`;
};

export const designPageLocationState = atomFamily<any, string>({
    key: getFullyQualifiedKey('designPageLocation'),
    default: {
        selected: '',
    },
});
