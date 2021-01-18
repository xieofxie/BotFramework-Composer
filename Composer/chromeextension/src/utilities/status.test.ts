/// <reference types="Jest"/>

import { Status, mergeStatus } from './status';

test('merge same', () => {
    for (let s in Status) {
        // interesting to see the compile result in https://www.typescriptlang.org/play
        const e = Status[s] as Status;
        expect(mergeStatus(e, e)).toEqual(e);
    }
})

test('merge different', () => {
    for (let s in Status) {
        for (let s2 in Status) {
            if (s2 == s) continue;
            const e = Status[s] as Status;
            const e2 = Status[s2] as Status;
            expect(mergeStatus(e, e2)).toEqual(Status.Both);
        }
    }
})
