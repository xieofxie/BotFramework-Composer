// Composer\packages\client\src\pages\design\DesignPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import { designPageLocationState, schemasState } from '../clientdummies/botState';
import plugins, { mergePluginConfigs } from '../clientdummies/plugins';
import { PropertyEditor } from '../clientdummies/PropertyEditor';
import { useShell } from '../clientdummies/useShell';
import { VisualEditor } from '../clientdummies/VisualEditor';
import { isTrigger } from '../utilities/schemas';
import { mergeStatus, getGitColor } from '../utilities/status';

export interface TriggersRendererProps {
    schemas: any;
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
    else if (typeof (data) === 'object') {
        if ('$kind' in data) {
            status = mergeStatus(status, data.gitStatus);
        }
        Object.values(data).forEach((value) => {
            status = mergeStatus(status, getGitStatus(value));
        });
    }
    return status;
};

const setTriggerGitStatus = (data: any) => {
    data?.triggers?.forEach((trigger) => {
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

const formatSelected = (selected: number) => `triggers[${selected}]`;

const renderOptions = (triggers: any[], hide: boolean) => {
    return triggers?.map((trigger, index) => {
        if (hide && !!!trigger.gitStatus) {
            return null;
        }
        let name = trigger.$kind;
        if (name == 'Microsoft.OnIntent') {
            name = `${name}[${trigger.intent}]`;
        } else if (name == 'Microsoft.OnDialogEvent') {
            name = `${name}[${trigger.event}]`;
        }
        const value = formatSelected(index);
        return (<option value={value} key={value} style={{ background: getGitColor(trigger.gitStatus) }}>{name}</option>);
    });
};

const TriggersRenderer: React.FC<TriggersRendererProps> = ({ schemas: inputSchemas, data, enableHide }) => {
    const projectId = 'dummyProjectId';
    const schemas = useRecoilValue(schemasState(projectId));
    const setSchemas = useSetRecoilState(schemasState(projectId));
    useEffect(() => {
        setSchemas(inputSchemas);
    }, []);

    const [hide, setHide] = useState(enableHide ? true : false);
    const [selectValue, setSelectValue] = useState('');

    const setFocusedEvent = useSetRecoilState(designPageLocationState(projectId));

    const renderData = useMemo(() => {
        if (enableHide) {
            setTriggerGitStatus(data);
        }
        // TODO simple workaround based on Composer\packages\adaptive-flow\src\adaptive-flow-renderer\widgets\TriggerSummary\TriggerSummary.tsx
        if (!!!data.triggers && !isTrigger(data.$kind)) {
            const trigger = { $kind: '', intent: '', actions: null };
            if (Array.isArray(data)) {
                trigger.actions = data;
            } else {
                trigger.actions = [data];
            }
            return trigger;
        }
        return data;
    }, [data, enableHide]);

    // set default selected
    useEffect(() => {
        let selected = 0;
        if (enableHide) {
            renderData?.triggers?.every((trigger, index) => {
                if (!!trigger.gitStatus) {
                    selected = index;
                    return false;
                }
                return true;
            });
        }

        setSelectValue(formatSelected(selected));

        if (renderData.triggers) {
            setFocusedEvent((old) => { return { ...old, selected: formatSelected(selected) }; });
        } else {
            setFocusedEvent((old) => { return { ...old, selected: '.' }; });
        }
    }, []);

    const allOptions = useMemo(() => {
        return renderOptions(renderData?.triggers, false);
    }, [renderData]);

    const hideOptions = useMemo(() => {
        if (enableHide) {
            return renderOptions(renderData?.triggers, true);
        }
        return null;
    }, [renderData, enableHide]);

    const hideTriggers = useMemo(() => {
        let result = [];
        if (enableHide) {
            renderData?.triggers?.forEach((trigger, index) => {
                if (!!trigger.gitStatus) {
                    result.push(formatSelected(index));
                }
            });
        }
        return result;
    }, [renderData, enableHide]);

    const hideButtonOnClick = () => {
        setHide((hide) => {
            if (!hide) {
                if (!hideTriggers.includes(selectValue)) {
                    const value: string = hideTriggers[0];
                    setFocusedEvent((old) => { return { ...old, selected: value }; });
                    setSelectValue(value);
                }
            }
            return !hide;
        });
    };

    const selectOnChange = (event) => {
        const value: string = event.target.value;
        setFocusedEvent((old) => { return { ...old, selected: value }; });
        setSelectValue(value);
    };

    const onBlur = (e) => { };
    const onFocus = (e) => { };

    const currentDialog = useMemo(() => {
        return { content: renderData };
    }, [renderData]);
    const shellForFlowEditor = useShell('FlowEditor', projectId, currentDialog);
    const shellForPropertyEditor = useShell('PropertyEditor', projectId, currentDialog);

    const pluginConfig: PluginConfig = useMemo(() => {
        const sdkUISchema = schemas?.ui?.content ?? {};
        // const userUISchema = schemas?.uiOverrides?.content ?? {};
        return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins);
      }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

    return (schemas==null?<div>Should use a Suspense..</div>:
        <div>
            <div>
                {enableHide ? <button onClick={() => { hideButtonOnClick() }}>Toggle Modified</button> : null}
                <select onChange={selectOnChange} value={selectValue}>
                    {hide ? hideOptions : allOptions}
                </select>
            </div>
            <div>
                <div style={{ float: 'left', width: '100%', height: '90vh', position: 'relative' }}>
                    {/*
// @ts-ignore */}
                    <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForFlowEditor}>
                        <VisualEditor
                            isRemoteSkill={false}
                            openNewTriggerModal={() => { }}
                            onBlur={onBlur}
                            onFocus={onFocus}
                        />
                    </EditorExtension>
                </div>
                {false &&
                    <div style={{ float: 'right', width: '20%', height: '90vh', overflow: 'scroll' }}>
                        <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
                            <PropertyEditor key={''} />
                        </EditorExtension>
                    </div>
                }
            </div>
        </div>
    );
};

export default TriggersRenderer;
