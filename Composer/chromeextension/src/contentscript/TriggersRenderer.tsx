import React, { useEffect, useMemo, useState } from 'react';
import VisualDesigner from '@bfc/adaptive-flow';
import AdaptiveForm, { resolveRef, getUIOptions } from '@bfc/adaptive-form';
import { EditorExtension, useFormConfig } from '@bfc/extension-client';

import { designPageLocationState } from '../clientdummies/botState';
import { useShell } from '../clientdummies/useShell';
import { mergeStatus, getGitColor } from '../utilities/status';
import { useSetRecoilState } from 'recoil';

export interface TriggersRendererProps {
    schema?: any;
    plugins?: any;
    data?: any;
    enableHide: boolean;
}

const getGitStatus = (data: any) => {
    let status = null;
    if (Array.isArray(data)) {
        data.forEach((value) => {
            status = mergeStatus(status, getGitStatus(value));
        });
    }
    else if (typeof(data) === 'object') {
        if('$kind' in data){
            status = mergeStatus(status, data.gitStatus);
        }
        Object.values(data).forEach((value) => {
            status = mergeStatus(status, getGitStatus(value));
        });
    }
    return status;
};

const setTriggerGitStatus = (data: any) => {
    data.triggers.forEach((trigger) => {
        // TODO a combination of all or data
        let status = getGitStatus(trigger);
        if (!!!status) {
            status = data.status;
        }
        if (!!status) {
            trigger.gitStatus = status;
        }
    });
};

const TriggersRenderer: React.FC<TriggersRendererProps> = ({schema, plugins, data, enableHide}) => {
    let selected = 0;
    if (enableHide) {
        setTriggerGitStatus(data);
        data?.triggers?.map((trigger, index) => {
            if(!!trigger.gitStatus){
                selected = index;
                return false;
            }
        });
    }

    const setFocusedEvent = useSetRecoilState(designPageLocationState('dummy'));
    useEffect(() => {
        setFocusedEvent({ selected: `triggers[${selected}]` });
    }, []);

    const [hide, setHide] = useState(true);

    const onBlur = (e) => {};
    const onFocus = (e) => {};
    const shellData = useShell();
    const radioOnChange = (event) => {
        const value: string = event.target.value;
        setFocusedEvent({ selected: value });
    };

    // Composer\packages\client\src\pages\design\PropertyEditor.tsx
    const formUIOptions = useFormConfig();
    const $uiOptions = useMemo(() => {
        return getUIOptions(schema, formUIOptions);
    }, [formUIOptions]);
    const handleDataChange = (newData?: any) => {
    };
    const handleFocusTab = (focusedTab) => {
    };

    return (
        <div>
            <div>
                {enableHide?<button onClick={()=>{setHide(!hide)}}>Toggle Modified</button>:null}
                <span onChange={radioOnChange}>
                    {data?.triggers?.map((trigger, index) => {
                        let name = trigger.$kind;
                        if (name == 'Microsoft.OnIntent') {
                            name = `${name}[${trigger.intent}]`;
                        } else if (name == 'Microsoft.OnDialogEvent') {
                            name = `${name}[${trigger.event}]`;
                        }
                        const value = `triggers[${index}]`;
                        if (enableHide && hide && !!!trigger.gitStatus) {
                            return null;
                        }
                        return (<label key={value} style={{background: getGitColor(trigger.gitStatus)}}><input type='radio' value={value} name='trigger' defaultChecked={index==selected}/>{name}</label>);
                    })}
                </span>
            </div>
            <div>
                <div style={{ float: 'left', width: '100%', height: '90vh', position: 'relative' }}>
            {/*
// @ts-ignore */}
                    <EditorExtension plugins={plugins} shell={shellData}>
                        <VisualDesigner
                            data={data}
                            schema={schema}
                            onBlur={onBlur}
                            onFocus={onFocus}
                        />
                    </EditorExtension>
                </div>
                {/*
                <div style={{ float: 'right', width: '20%', height: '90vh', overflow: 'scroll' }}>
                    <AdaptiveForm
                        errors={{}}
                        focusedTab={''}
                        formData={data}
                        schema={schema}
                        uiOptions={$uiOptions}
                        onChange={handleDataChange}
                        onFocusedTab={handleFocusTab}
                    />
                </div>
                */}
            </div>
        </div>
    );
};

export default TriggersRenderer;
