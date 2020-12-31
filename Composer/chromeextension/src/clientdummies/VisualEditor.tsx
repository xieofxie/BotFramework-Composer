// Composer\packages\client\src\pages\design\VisualEditor.tsx

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import VisualDesigner from '@bfc/adaptive-flow';
import { useRecoilValue } from 'recoil';
import { useFormConfig, useShellApi } from '@bfc/extension-client';
import cloneDeep from 'lodash/cloneDeep';

import { designPageLocationState, schemasState } from './botState';

interface VisualEditorProps {
    openNewTriggerModal: () => void;
    onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
    isRemoteSkill?: boolean;
}

const VisualEditor: React.FC<VisualEditorProps> = (props) => {
    const { ...shellData } = useShellApi();
    const { projectId, currentDialog } = shellData;
    const { openNewTriggerModal, onFocus, onBlur, isRemoteSkill } = props;
    const schemas = useRecoilValue(schemasState(projectId));
    const designPageLocation = useRecoilValue(designPageLocationState(projectId));
    const { dialogId, selected } = designPageLocation;

    const formConfig = useFormConfig();
    const overridedSDKSchema = useMemo(() => {
        if (!dialogId) return {};

        const sdkSchema = cloneDeep(schemas.sdk?.content ?? {});
        const sdkDefinitions = sdkSchema.definitions;

        // Override the sdk.schema 'title' field with form ui option 'label' field
        // to make sure the title is consistent with Form Editor.
        Object.entries(formConfig).forEach(([$kind, formOptions]) => {
            if (formOptions && sdkDefinitions[$kind]) {
                sdkDefinitions[$kind].title = formOptions?.label;
            }
        });
        return sdkSchema;
    }, [formConfig, schemas, dialogId]);

    return (
        <VisualDesigner
            data={currentDialog.content ?? {}}
            schema={overridedSDKSchema}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
};

export { VisualEditor };
