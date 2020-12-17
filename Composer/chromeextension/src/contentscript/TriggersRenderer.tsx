import React, { useState } from 'react';
import VisualDesigner from '@bfc/adaptive-flow';
import { EditorExtension } from '@bfc/extension-client';

export interface TriggersRendererProps {
    schema?: any;
    plugins?: any;
    data?: any;
}

const TriggersRenderer: React.FC<TriggersRendererProps> = ({schema, plugins, data}) => {
    const [focusedEvent, setFocusedEvent] = useState('triggers[0]');

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
            <div onChange={radioOnChange}>
                {data?.triggers?.map((trigger, index) => {
                    let name = trigger.$kind;
                    if (name == 'Microsoft.OnIntent') {
                        name = `${name}[${trigger.intent}]`;
                    } else if (name == 'Microsoft.OnDialogEvent') {
                        name = `${name}[${trigger.event}]`;
                    }
                    const value = `triggers[${index}]`;
                    return (<label key={value}><input type='radio' value={value} name='trigger'/>{name}</label>);
                })}
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
