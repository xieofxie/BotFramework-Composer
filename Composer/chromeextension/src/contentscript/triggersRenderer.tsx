import React, { useState } from 'react';
import VisualDesigner from '@bfc/adaptive-flow';
import { EditorExtension } from '@bfc/extension-client';

import { mergeStatus, getGitColor } from '../utilities/status';

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

    const [focusedEvent, setFocusedEvent] = useState(`triggers[${selected}]`);
    const [hide, setHide] = useState(true);

    const onBlur = (e) => {};
    const onFocus = (e) => {};
    const shellData = {
        // ApplicationContextApi
        api: {
            addCoachMarkRef: (ref) => {},
        },
        data: {
            focusedEvent: focusedEvent,
        },
    };
    const radioOnChange = (event) => {
        setFocusedEvent(event.target.value);
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
            <div style={{ position: 'relative', height: '90vh'}}>
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
        </div>
    );
};

export default TriggersRenderer;
