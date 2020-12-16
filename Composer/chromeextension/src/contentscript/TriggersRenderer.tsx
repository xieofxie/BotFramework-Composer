import React, { useState } from 'react';
import VisualDesigner from '@bfc/adaptive-flow';
import { EditorExtension } from '@bfc/extension-client';

export interface TriggersRendererProps {
    schema?: any;
    data?: any;
}

const TriggersRenderer: React.FC<TriggersRendererProps> = ({schema, data}) => {
    const [focusedEvent, setFocusedEvent] = useState('triggers[0]');

    const onBlur = (e) => {};
    const onFocus = (e) => {};
    const uischema = {};
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
                    return (<label><input type='radio' value={`triggers[${index}]`} name='trigger' />{name}</label>);
                })}
            </div>
            <div style={{ position: 'relative', height: '90vh'}}>
            {/*
// @ts-ignore */}
                <EditorExtension plugins={{ uiSchema: uischema, widgets: { flow: {}, recognizer: {} } }} shell={shellData}>
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
