// Composer\packages\client\src\pages\design\PropertyEditor.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdaptiveForm, { resolveRef, getUIOptions } from '@bfc/adaptive-form';
import { FormErrors, JSONSchema7, useFormConfig, useShellApi } from '@bfc/extension-client';
import get from 'lodash/get';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

function resolveBaseSchema(schema: JSONSchema7, $kind: string): JSONSchema7 | undefined {
    const defSchema = schema.definitions?.[$kind];
    if (defSchema && typeof defSchema === 'object') {
        return {
            ...resolveRef(defSchema, schema.definitions),
            definitions: schema.definitions,
        };
    }
}

const PropertyEditor: React.FC = () => {
    const { shellApi, ...shellData } = useShellApi();
    const { currentDialog, focusPath, focusedSteps, focusedTab, schemas, projectId } = shellData;
    const { onFocusSteps } = shellApi;
    const dialogData = useMemo(() => {
        if (currentDialog?.content) {
            return focusedSteps[0] ? get(currentDialog.content, focusedSteps[0]) : currentDialog.content;
        } else {
            return {};
        }
    }, [currentDialog, focusedSteps[0]]);
    const [localData, setLocalData] = useState(dialogData as MicrosoftAdaptiveDialog);

    const formUIOptions = useFormConfig();

    const $schema = useMemo(() => {
        if (schemas?.sdk?.content && localData) {
            return resolveBaseSchema(schemas.sdk.content, localData.$kind);
        }
    }, [schemas?.sdk?.content, localData.$kind]);

    const $uiOptions = useMemo(() => {
        return getUIOptions($schema, formUIOptions);
    }, [$schema, formUIOptions]);

    const errors = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDataChange = (newData?: any) => {
        setLocalData(newData);
    };

    const handleFocusTab = (focusedTab) => {
        onFocusSteps(focusedSteps, focusedTab);
    };

    return (
        <AdaptiveForm
            errors={errors}
            focusedTab={focusedTab}
            formData={localData}
            schema={$schema}
            uiOptions={$uiOptions}
            onChange={handleDataChange}
            onFocusedTab={handleFocusTab}
        />
    );
};

export { PropertyEditor };
