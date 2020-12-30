import React from 'react';
import { getBezierPath, getMarkerEnd, EdgeText, getEdgeCenter } from 'react-flow-renderer';

import EdgeTextWithClick from './EdgeTextWithClick';

// https://reactflow.dev/examples/edges/

export default function EdgeWithOccurrence({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId,
}) {
  const [centerX, centerY] = getEdgeCenter({ sourceX, sourceY, targetX, targetY });
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd}/>
      <EdgeTextWithClick
        x={centerX}
        y={centerY}
        label={data.text}
        onClick={(e)=>data.onClick(data)}/>
    </>
  );
}
