import React from 'react';
import { useRecoilValue } from 'recoil';
import { DialogInfo } from '@bfc/extension-client';

import { showAllState, setVisibility, setEdgeStyle } from './others';

export interface NodeLabelProps {
  projectId: string;
  dialog: DialogInfo;
  setSelectEle: any;
  setElements: any;
}

export const NodeLabel = ({ projectId, dialog, setSelectEle, setElements }: NodeLabelProps) => {
  const showAll = useRecoilValue(showAllState);

  const linkOnClick = (id: string) => {
    setSelectEle(id);
    setElements((elements) => {
      let newEles = setVisibility(elements, showAll ? null : id);
      return setEdgeStyle(newEles, id);
    });
  };
  return (
    <>
      <p>{dialog.id}</p>
      <button onClick={() => linkOnClick(dialog.id)}>Link</button>
      <a href={`/bot/${projectId}/dialogs/${dialog.id}`} target="_parent">
        Open
      </a>
    </>
  );
};
