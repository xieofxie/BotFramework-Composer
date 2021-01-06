import { atom } from 'recoil';
import { isNode, isEdge, Edge, Node, Position } from 'react-flow-renderer';
import dagre from 'dagre';
import { Colors } from '../styles';

export const showAllState = atom({
  key: 'showAllState',
  default: false,
});

export const autoLayoutState = atom({
  key: 'autoLayoutState',
  default: false,
});

export const widthState = atom({
  key: 'widthState',
  default: 150,
});

export const heightState = atom({
  key: 'heightState',
  default: 150,
});

export const directionState = atom({
  key: 'directionState',
  default: 'TB',
});

export const alwaysState = atom({
  key: 'alwaysState',
  default: new Set<string>(),
});

export const setVisibility = (elements: (Node | Edge)[], id: string, always: Set<string>) => {
  const nodes = new Set<string>();
  const res = elements.map((e) => {
    if (id == null) {
      e.isHidden = false;
    } else if (isEdge(e)) {
      if (e.source == id || e.target == id || always.has(e.source) || always.has(e.target)) {
        e.isHidden = false;
        nodes.add(e.source);
        nodes.add(e.target);
      } else {
        e.isHidden = true;
      }
    }
    return e;
  });
  if (id == null) {
    return res;
  }
  res.forEach((r) => {
    if (isNode(r)) {
      if (nodes.has(r.id)) {
        r.isHidden = false;
      } else {
        r.isHidden = true;
      }
    }
  });
  return res;
};

export const setSelectStyle = (elements: (Node | Edge)[], id: string) => {
  return elements.map((e) => {
    if (isNode(e)) {
      if (e.id == id) {
        e.style = {...e.style, borderColor: Colors.blue0, borderWidth: '2px'};
      } else {
        e.style = {...e.style, borderColor: Colors.gray1, borderWidth: '1px'};
      }
      return e;
    }
    if (e.source === id || e.target == id) {
      e.style = { stroke: Colors.gray0, strokeWidth: 2 };
    } else {
      e.style = { stroke: Colors.gray1, strokeWidth: 1 };
    }
    return e;
  });
};

export const getLayoutedElements = (elements: (Node | Edge)[], direction: string, width: number, height: number) => {
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
