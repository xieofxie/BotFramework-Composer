import { atom } from 'recoil';
import { isNode, isEdge, Edge, Node } from 'react-flow-renderer';

export const showAllState = atom({
  key: 'showAllState',
  default: false,
});

export const setVisibility = (elements: (Node | Edge)[], id: string) => {
  const nodes = new Set<string>();
  const res = elements.map((e) => {
    if (id == null) {
      e.isHidden = false;
    } else if (isEdge(e)) {
      if (e.source === id || e.target == id) {
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

export const setEdgeStyle = (elements: (Node | Edge)[], id: string) => {
  return elements.map((e) => {
    if (!isEdge(e)) return e;
    if (e.source === id || e.target == id) {
      e.style = { stroke: 'black', strokeWidth: 2 };
    } else {
      e.style = { stroke: 'gray' };
    }
    return e;
  });
};
