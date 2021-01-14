// Composer\packages\client\src\pages\design\DesignPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import Split from 'react-split'

import { designPageLocationState, schemasState } from '../clientdummies/botState';
import plugins, { mergePluginConfigs } from '../clientdummies/plugins';
import { PropertyEditor } from '../clientdummies/PropertyEditor';
import { useShell } from '../clientdummies/useShell';
import { VisualEditor } from '../clientdummies/VisualEditor';
import { isTrigger } from '../utilities/schemas';
import { Status, mergeStatus, getGitColor } from '../utilities/status';
import { dividerColor } from '../utilities/styles';

export interface TriggersRendererProps {
    schemas: any;
    data?: any;
    dataGetter?: ()=>Promise<any>;
    enableHide: boolean;
    enableProperty: boolean;
}

// TODO make it resizable
const editorHeight = '80vh';

const getGitStatus = (data: any): Status => {
    let status: Status = null;
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

const setTriggerGitStatus = (data: any): void => {
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

const TriggersRenderer: React.FC<TriggersRendererProps> = ({ schemas: inputSchemas, data: inputData, dataGetter, enableHide, enableProperty }) => {
    const projectId = 'dummyProjectId';
    const schemas = useRecoilValue(schemasState(projectId));
    const setSchemas = useSetRecoilState(schemasState(projectId));
    useEffect(() => {
        setSchemas(inputSchemas);
    }, []);
    const [data, setData] = useState(inputData);

    const [hide, setHide] = useState(enableHide ? true : false);
    const [selectValue, setSelectValue] = useState('');

    const setFocusedEvent = useSetRecoilState(designPageLocationState(projectId));

    const renderData = useMemo(() => {
        if(!data) return null;
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

    useEffect(() => {
        (async ()=>{
            if (dataGetter) {
                setData(await dataGetter());
            }
        })();
    }, [dataGetter, setData]);

    // set default selected
    useEffect(() => {
        if (!renderData) return;
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

        if (renderData.triggers) {
            const fSelected = formatSelected(selected);
            setSelectValue(fSelected);
            setFocusedEvent((old) => { return {
                ...old,
                selected: fSelected,
                focused: fSelected,
            };});
        } else {
            const fSelected = '.';
            setSelectValue(fSelected);
            const fFocused = 'actions[0]';
            setFocusedEvent((old) => { return {
                ...old,
                selected: fSelected,
                focused: fFocused
            };});
        }
    }, [renderData]);

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
                    setFocusedEvent((old) => { return {
                        ...old,
                        selected: value,
                        focused: '',
                    };});
                    setSelectValue(value);
                }
            }
            return !hide;
        });
    };

    const selectOnChange = (event) => {
        const value: string = event.target.value;
        setFocusedEvent((old) => { return {
            ...old,
            selected: value,
            focused: value,
        };});
        setSelectValue(value);
    };

    const onBlur = (e) => {
    };
    const onFocus = (e) => {
    };

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

    return (renderData==null?<div>Should use a Suspense..</div>:
        <div>
            <div>
                {enableHide ? <button onClick={() => { hideButtonOnClick() }}>Toggle Modified</button> : null}
                <select onChange={selectOnChange} value={selectValue}>
                    {hide ? hideOptions : allOptions}
                </select>
            </div>
            <Split direction='horizontal' sizes={[70, 30]} gutterStyle={
                (dimension, gutterSize, index) => {
                    return {
                        width: '10px',
                        float: 'left',
                        height: editorHeight,
                        marginLeft: '0px',
                        marginRight: '0px',
                        backgroundColor: dividerColor,
                    }}}>
                <div style={{ float: 'left', height: editorHeight, position: 'relative' }}>
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
                {!enableProperty ||
                    <div style={{ float: 'left', height: editorHeight, overflow: 'scroll' }}>
                        <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
                            <PropertyEditor key={''} />
                        </EditorExtension>
                    </div>
                }
            </Split>
        </div>
    );
};

export default TriggersRenderer;
