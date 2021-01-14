export enum Status{
    Addition = 'addition',
    Deletion = 'deletion',
    Both = 'both',
}

export function mergeStatus(s0: Status, s1: Status): Status {
    if (s0) {
        if (s1) {
            if (s0 == s1) {
                return s0;
            } else {
                return Status.Both;
            }
        } else {
            return s0;
        }
    } else {
        return s1;
    }
}

// Same as Composer\packages\adaptive-flow\src\adaptive-flow-renderer\widgets\ActionHeader\ActionHeader.tsx
export const getGitColor = (gitStatus: Status): string => {
    if (gitStatus === Status.Deletion) {
        return '#ffeef0';
    } else if (gitStatus === Status.Addition) {
        return '#e6ffed';
    } else if (gitStatus === Status.Both) {
        return '#ffff00';
    }
    return '';
};
