export function mergeStatus(s0, s1) {
    if (s0) {
        if (s1) {
            if (s0 == s1) {
                return s0;
            } else {
                return 'both';
            }
        } else {
            return s0;
        }
    } else {
        return s1;
    }
}

// Same as Composer\packages\adaptive-flow\src\adaptive-flow-renderer\widgets\ActionHeader\ActionHeader.tsx
export const getGitColor = (gitStatus: string): string => {
    if (gitStatus === 'deletion') {
        return '#ffeef0';
    } else if (gitStatus === 'addition') {
        return '#e6ffed';
    } else if (gitStatus === 'both') {
        return '#ffff00';
    }
    return '';
};
