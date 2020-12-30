// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState, useCallback, useEffect, Fragment } from 'react';
import { render, useProjectApi } from '@bfc/extension-client';
import {
  DetailsList,
  ScrollablePane,
  ScrollbarVisibility,
  CheckboxVisibility,
  DetailsListLayoutMode,
  IColumn,
  TextField,
} from '@fluentui/react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  isNode,
  isEdge,
  ConnectionLineType,
  Position,
} from 'react-flow-renderer';
import dagre from 'dagre';

import { layoutflow, controls } from '../styles';
import EdgeWithOccurrence from './EdgeWithOccurrence';
import { stringify } from 'querystring';

const position = { x: 0, y: 0 };

const getLayoutedElements = (elements, direction, width: number, height: number) => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  elements.forEach((el) => {
    if (el.isHidden) return;
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width, height });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });
  dagre.layout(dagreGraph);
  return elements.map((el) => {
    if (el.isHidden) return el;
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? Position.Left : Position.Top;
      el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      // unfortunately we need this little hack to pass a slighltiy different position
      // in order to notify react flow about the change
      el.position = {
        x: nodeWithPosition.x + Math.random() / 1000,
        y: nodeWithPosition.y,
      };
    }
    return el;
  });
};

interface LinkDetail {
  id: string,
  path: string,
  kind: string,
};

const getLinkedDialogs = (parent: string, data: any, ids: Map<string, LinkDetail[]>) => {
  if (Array.isArray(data)) {
      data.forEach((value) => {
        if (!!!value.$designer) return;
        getLinkedDialogs(parent + `["${value.$designer.id}"]`, value, ids);
      });
  }
  else if (typeof(data) === 'object') {
      if('$kind' in data){
          if (data.$kind == 'Microsoft.BeginDialog' || data.$kind == 'Microsoft.ReplaceDialog') {
            if (!ids.has(data.dialog)) {
              ids.set(data.dialog, []);
            }
            ids.get(data.dialog).push({
              id: data.dialog,
              path: parent,
              kind: data.$kind,
            });
            return;
          }
      }
      Object.entries(data).forEach(([key, value]) => {
        getLinkedDialogs(parent + `.${key}`, value, ids);
      });
  }
  return status;
};

const getEdgeInfo = (projectId: string, source: string, details: LinkDetail[]) => {
  const list = details.map((detail, index) => {
    const triggerIndex = detail.path.indexOf(']');
    const trigger = detail.path.substring(1, triggerIndex + 1);
    const focused = detail.path.substring(1);
    const url = `/bot/${projectId}/dialogs/${source}?selected=${trigger}&focused=${focused}`;
    return (
      <Fragment key={index}>
        <p>{detail.kind}</p>
        <p><a href={url} target='_parent'>{focused}</a></p>
      </Fragment>
    );
  });
  return <div><p>Occurrences:</p>{list}</div>;
};

const getDialogInfo = (projectId: string, source: string, content: any) => {
  return <div>
    <p>This dialog has the following triggers:</p>
    {content.triggers.map((trigger) => {
      const name = trigger.$designer.name || trigger.intent || trigger.$kind;
      const url = `/bot/${projectId}/dialogs/${source}?selected=triggers["${trigger.$designer.id}"]`;
      return <p key={trigger.$designer.id}><a href={url} target='_parent'>{name}</a></p>;
    })}
  </div>;
};

const edgeTypes = {
  custom: EdgeWithOccurrence,
};

const Main: React.FC = () => {
  const { projectId, dialogs } = useProjectApi();
  const [elements, setElements] = useState([]);
  const [info, setInfo] = useState(null);
  const edgeOnClick = useCallback((data: any) => {
    setInfo(data.info);
  }, [info]);
  const items = useMemo(() => {
    const all: any[] = [];
    const edges = new Map<string, Map<string, LinkDetail[]>>();

    dialogs.forEach((d) => {
      const linkOnClick = ()=>{
        setElements((elements) => {
          return elements.map((e) => {
            e.isHidden = false;
            if(!isEdge(e)) return e;
            if(e.source === d.id || e.target == d.id){
              e.style = { stroke: 'black', strokeWidth: 4 };
            }else{
              e.style = { stroke: 'gray' };
            }
            return e;
          });
        });
      };
      const onlyOnClick = ()=>{
        setElements((elements) => {
          const shown = new Set<string>();
          shown.add(d.id);
          const eles = elements.map((e) => {
            e.isHidden = true;
            if(!isEdge(e)) return e;
            if(e.source === d.id || e.target == d.id){
              e.isHidden = false;
              shown.add(e.source);
              shown.add(e.target);
              e.style = { stroke: 'black', strokeWidth: 4 };
            }
            return e;
          });
          eles.forEach((e) => {
            if(!isNode(e)) return;
            if (shown.has(e.id)) {
              e.isHidden = false;
            }
          });
          return eles;
        });
      };
      const info = getDialogInfo(projectId, d.id, d.content);
      const infoOnClick = ()=>{
        setInfo(info);
      };
      const label = (
        <>
          <div onClick={infoOnClick}>{d.id}</div>
          <div onClick={infoOnClick}>
            <button onClick={linkOnClick}>Link</button>
            <button onClick={onlyOnClick}>Only</button>
            <a href={`/bot/${projectId}/dialogs/${d.id}`} target='_parent'>Open</a>
          </div>
        </>
      );

      all.push({
        id: d.id,
        data: { label },
        position,
      });
      const ids = new Map<string, LinkDetail[]>();
      getLinkedDialogs('', d.content, ids);
      edges.set(d.id, ids);
    });
    edges.forEach((targets, source) => {
      targets.forEach((details, target) => {
        const info = getEdgeInfo(projectId, source, details);
        all.push({
          id: `${source}->${target}`,
          source,
          target,
          type: 'custom',
          arrowHeadType: 'arrowclosed',
          style: { stroke: 'gray' },
          data: {
            text: `(${details.length})`,
            info,
            onClick: edgeOnClick,
          },
        });
      });
    });

    return all;
  }, [dialogs]);

  const [direction, setDirection] = useState('TB');
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(50);
  const setDirectionOnClick = useCallback((value) => {
    setDirection(value);
    setElements(getLayoutedElements(items, value, width, height))
  }, [items, direction, width, height]);
  const setWidthOnChange = useCallback((value) => {
    setWidth(value);
    setElements(getLayoutedElements(items, direction, value, height))
  }, [items, direction, width, height]);
  const setHeightOnChange = useCallback((value) => {
    setHeight(value);
    setElements(getLayoutedElements(items, direction, width, value))
  }, [items, direction, width, height]);

  useEffect(()=>{
    setElements(getLayoutedElements(items, direction, width, height));
  }, []);

  return (
    <div>
      <ReactFlowProvider>
        <ReactFlow
          className={layoutflow}
          elements={elements}
          connectionLineType={ConnectionLineType.SmoothStep}
          edgeTypes={edgeTypes}
        />
        <div className={controls}>
          <button onClick={() => setDirectionOnClick('TB')}>vertical layout</button>
          <button onClick={() => setDirectionOnClick('LR')}>horizontal layout</button>
          <p>layout width: {width}</p>
          <input type="range" min="50" max="500" defaultValue={width} onChange={(e) => setWidthOnChange(Number.parseInt(e.target.value))} style={{width: '100%'}}></input>
          <p>layout height: {height}</p>
          <input type="range" min="50" max="500" defaultValue={height} onChange={(e) => setHeightOnChange(Number.parseInt(e.target.value))} style={{width: '100%'}}></input>
          <div style={{maxHeight: '50vh', overflow: 'scroll'}}>
            {info}
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

render(<Main />);
