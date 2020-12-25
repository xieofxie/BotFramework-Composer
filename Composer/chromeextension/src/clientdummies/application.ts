// Composer\packages\client\src\recoilModel\dispatchers\application.ts

import { CallbackInterface, useRecoilCallback } from 'recoil';
import debounce from 'lodash/debounce';

import {
    announcementState,
} from './appState';

export const applicationDispatcher = () => {
    const setMessage = useRecoilCallback(({ set }: CallbackInterface) => (message: string) => {
        set(announcementState, message);
    });

    return {
        setMessage: debounce(setMessage, 500),
    };
};
