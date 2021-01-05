// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState, useCallback, useEffect, Fragment } from 'react';
import { render, useProjectApi } from '@bfc/extension-client';
import ReactFlow, {
  ReactFlowProvider,
  isNode,
  isEdge,
  ConnectionLineType,
  Position,
  Node,
  Edge,
  ArrowHeadType,
  MiniMap,
  Controls,
} from 'react-flow-renderer';
import dagre from 'dagre';
import { RecoilRoot, useRecoilState } from 'recoil';

import { layoutflow, controls, Colors } from '../styles';
import EdgeWithOccurrence from './EdgeWithOccurrence';
import { showAllState, setVisibility, setEdgeStyle } from './others';
import { NodeLabel } from './NodeLabel';

interface LinkDetail {
  path: string;
  kind: string;
}

const position = { x: 0, y: 0 };

const edgeTypes = {
  custom: EdgeWithOccurrence,
};

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

const getLinkedDialogs = (parent: string, data: any, ids: Map<string, LinkDetail[]>) => {
  if (Array.isArray(data)) {
    data.forEach((value) => {
      if (!!!value.$designer) return;
      getLinkedDialogs(parent + `["${value.$designer.id}"]`, value, ids);
    });
  } else if (typeof data === 'object') {
    if ('$kind' in data) {
      if (data.$kind == 'Microsoft.BeginDialog' || data.$kind == 'Microsoft.ReplaceDialog') {
        if (!ids.has(data.dialog)) {
          ids.set(data.dialog, []);
        }
        ids.get(data.dialog).push({
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

const getEdgeInfo = (projectId: string, source: string, data: any, target: string, details: LinkDetail[]) => {
  const list = details.map((detail, index) => {
    const triggerEnd = detail.path.indexOf(']');
    const triggerBegin = detail.path.indexOf('[');
    // the path is tooo weird
    const triggerId = detail.path.substring(triggerBegin + 2, triggerEnd - 1);
    const trigger = detail.path.substring(1, triggerEnd + 1);
    const focused = detail.path.substring(1);
    const url = `/bot/${projectId}/dialogs/${source}?selected=${trigger}&focused=${focused}`;
    let triggerInfo = '';
    data.triggers.every((trigger) => {
      if (trigger.$designer.id == triggerId) {
        if (!!trigger.$designer.name) {
          triggerInfo = trigger.$designer.name;
          return false;
        }
        let name = trigger.$kind;
        if (name == 'Microsoft.OnIntent') {
          name = `${name}[${trigger.intent}]`;
        } else if (name == 'Microsoft.OnDialogEvent') {
          name = `${name}[${trigger.event}]`;
        }
        triggerInfo = name;
        return false;
      }
      return true;
    });
    return (
      <Fragment key={index}>
        <p>
          <a href={url} target="_parent">
            {triggerInfo}:{detail.kind}
          </a>
        </p>
      </Fragment>
    );
  });
  return (
    <div>
      <p>
        {source} calls {target} in:
      </p>
      {list}
    </div>
  );
};

const Main: React.FC = () => {
  const { projectId, dialogs } = useProjectApi();
  const [elements, setElements] = useState<(Node | Edge)[]>([]);
  const [selectEle, setSelectEle] = useState(null);
  const [info, setInfo] = useState(null);
  const [showAll, setShowAll] = useRecoilState(showAllState);

  const edgeOnClick = useCallback(
    (data: any) => {
      setInfo(data.info);
    },
    [setInfo]
  );

  const items: (Node | Edge)[] = useMemo(() => {
    const all: (Node | Edge)[] = [];
    const edges = new Map<string, Map<string, LinkDetail[]>>();
    const dialogsMap = new Map<string, any>();

    dialogs.forEach((d) => {
      const label = (
        <>
          <NodeLabel projectId={projectId} dialog={d} setSelectEle={setSelectEle} setElements={setElements}></NodeLabel>
        </>
      );
      all.push({
        id: d.id,
        isHidden: true,
        style: { backgroundColor: d.isRoot ? Colors.blue1 : null },
        data: {
          isRoot: d.isRoot,
          info,
          label,
        },
        position,
      });
      const ids = new Map<string, LinkDetail[]>();
      getLinkedDialogs('', d.content, ids);
      edges.set(d.id, ids);
      dialogsMap.set(d.id, d.content);
    });
    edges.forEach((targets, source) => {
      targets.forEach((details, target) => {
        const info = getEdgeInfo(projectId, source, dialogsMap.get(source), target, details);
        all.push({
          id: `${source}->${target}`,
          isHidden: true,
          source,
          target,
          type: 'custom',
          arrowHeadType: ArrowHeadType.Arrow,
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

  const setShowAllOnChange = useCallback(
    (event) => {
      const newShowAll = !showAll;
      setShowAll(newShowAll);
      if (newShowAll) {
        setElements((elements) => {
          return setVisibility(elements, null);
        });
      } else {
        setElements((elements) => {
          return setVisibility(elements, selectEle);
        });
      }
    },
    [showAll, setShowAll, selectEle, setElements]
  );

  // layout variables
  const [direction, setDirection] = useState('TB');
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(150);
  const setDirectionOnClick = useCallback(
    (value) => {
      setDirection(value);
      setElements(getLayoutedElements(items, value, width, height));
    },
    [setElements, items, setDirection, width, height]
  );
  const setWidthOnChange = useCallback(
    (value) => {
      setWidth(value);
      setElements(getLayoutedElements(items, direction, value, height));
    },
    [setElements, items, direction, setWidth, height]
  );
  const setHeightOnChange = useCallback(
    (value) => {
      setHeight(value);
      setElements(getLayoutedElements(items, direction, width, value));
    },
    [setElements, items, direction, width, setHeight]
  );

  useEffect(() => {
    let root = '';
    items.every((value) => {
      if (value.data.isRoot) {
        root = value.id;
        return false;
      }
      return true;
    });
    setSelectEle(root);
    let newItems = setVisibility(items, showAll ? null : root);
    newItems = setEdgeStyle(newItems, root);
    setElements(getLayoutedElements(newItems, direction, width, height));
  }, []);

  return (
    <div>
      <ReactFlowProvider>
        <ReactFlow
          className={layoutflow}
          elements={elements}
          connectionLineType={ConnectionLineType.SmoothStep}
          edgeTypes={edgeTypes}
        >
          <MiniMap
            nodeStrokeColor={(n: Node) => {
              if (n.style?.background) return `${n.style.background}`;
              if (n.type === 'input') return '#0041d0';
              if (n.type === 'output') return '#ff0072';
              if (n.type === 'default') return '#1a192b';
              return '#eee';
            }}
            nodeColor={(n: Node) => {
              if (n.style?.background) return `${n.style.background}`;
              return '#fff';
            }}
            nodeBorderRadius={2}
          />
          <Controls />
        </ReactFlow>
        <div className={controls}>
          <div style={{ border: `1px solid ${Colors.gray0}` }}>
            <label>
              <input type="checkbox" defaultChecked={showAll} onChange={setShowAllOnChange} />
              Show All
            </label>
            <button onClick={() => setDirectionOnClick('TB')}>Vertical layout</button>
            <button onClick={() => setDirectionOnClick('LR')}>Horizontal layout</button>
            <p>Layout width: {width}</p>
            <input
              type="range"
              min="50"
              max="500"
              defaultValue={width}
              onChange={(e) => setWidthOnChange(Number.parseInt(e.target.value))}
              style={{ width: '100%' }}
            ></input>
            <p>Layout height: {height}</p>
            <input
              type="range"
              min="50"
              max="500"
              defaultValue={height}
              onChange={(e) => setHeightOnChange(Number.parseInt(e.target.value))}
              style={{ width: '100%' }}
            ></input>
          </div>

          <div style={{ maxHeight: '50vh', overflow: 'scroll' }}>{info}</div>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

render(
  <RecoilRoot>
    <Main />
  </RecoilRoot>
);
