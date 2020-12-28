// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState, useCallback } from 'react';
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
  ConnectionLineType,
  Position,
} from 'react-flow-renderer';
import dagre from 'dagre';

import { layoutflow, controls } from '../styles';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const position = { x: 0, y: 0 };

const getLayoutedElements = (elements, direction, width: number, height: number) => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });
  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width, height });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });
  dagre.layout(dagreGraph);
  return elements.map((el) => {
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

const getLinkedDialogs = (data: any, ids: string[]) => {
  if (Array.isArray(data)) {
      data.forEach((value) => {
        getLinkedDialogs(value, ids);
      });
  }
  else if (typeof(data) === 'object') {
      if('$kind' in data){
          if (data.$kind == 'Microsoft.BeginDialog' || data.$kind == 'Microsoft.ReplaceDialog') {
            ids.push(data.dialog);
            return;
          }
      }
      Object.values(data).forEach((value) => {
        getLinkedDialogs(value, ids);
      });
  }
  return status;
};

const Main: React.FC = () => {
  const { projectId, dialogs } = useProjectApi();
  const items = useMemo(() => {
    const all: any[] = [];
    const edges: Map<string, string[]> = new Map<string, string[]>();

    dialogs.forEach((d) => {
      const label = (
        <>
          <div>{d.id}</div>
          <div><a href={`/bot/${projectId}/dialogs/${d.id}`} target='_parent'>In Design</a></div>
        </>
      );

      all.push({
        id: d.id,
        data: { label },
        position,
      });
      const ids: string[] = [];
      getLinkedDialogs(d.content, ids);
      edges.set(d.id, ids);
    });
    edges.forEach((values, key) => {
      values.forEach((value) => {
        all.push({
          id: `${key}->${value}`,
          source: key,
          target: value,
          animated: true,
        });
      });
    });

    return all;
  }, [dialogs]);

  const [direction, setDirection] = useState('TB');
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(50);
  // no modification
  const onConnect = (params) => {};// setElements((els) => addEdge({ ...params, type: 'smoothstep', animated: true }, els));
  const onElementsRemove = (elementsToRemove) => {};// setElements((els) => removeElements(elementsToRemove, els));
  const elements = useMemo(
    () => {
      return getLayoutedElements(items, direction, width, height);
    },
    [items, direction, width, height]
  );
  return (
    <div>
      <ReactFlowProvider>
        <ReactFlow
          className={layoutflow}
          elements={elements}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
          connectionLineType={ConnectionLineType.SmoothStep}
        />
        <div className={controls}>
          <button onClick={() => setDirection('TB')}>vertical layout</button>
          <button onClick={() => setDirection('LR')}>horizontal layout</button>
          <p>layout width: {width}</p>
          <input type="range" min="50" max="500" defaultValue="150" onChange={(e) => setWidth(Number.parseInt(e.target.value))}></input>
          <p>layout height: {height}</p>
          <input type="range" min="50" max="500" defaultValue="50" onChange={(e) => setHeight(Number.parseInt(e.target.value))}></input>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

render(<Main />);
