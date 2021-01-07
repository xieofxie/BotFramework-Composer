import React from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { DialogInfo } from '@bfc/extension-client';

import {
  showAllState,
  setVisibility,
  setSelectStyle,
  autoLayoutState,
  getLayoutedElements,
  widthState,
  heightState,
  directionState,
  alwaysState,
} from './others';
import { nodecontrol } from '../styles';

export interface NodeLabelProps {
  projectId: string;
  dialog: DialogInfo;
  setSelectEle: any;
  setElements: any;
}

export const NodeLabel = ({ projectId, dialog, setSelectEle, setElements }: NodeLabelProps) => {
  const showAll = useRecoilValue(showAllState);
  const autoLayout = useRecoilValue(autoLayoutState);
  const width = useRecoilValue(widthState);
  const height = useRecoilValue(heightState);
  const direction = useRecoilValue(directionState);
  const [always, setAlways] = useRecoilState(alwaysState);

  const linkOnClick = (id: string) => {
    setSelectEle(id);
    setElements((elements) => {
      let newEles = setVisibility(elements, showAll ? null : id, always);
      newEles = setSelectStyle(newEles, id);
      if (autoLayout) {
        return getLayoutedElements(newEles, direction, width, height);
      } else {
        return newEles;
      }
    });
  };

  const setAlwaysOnChange = (event) => {
    event.stopPropagation();
    setAlways((old) => {
      if (old.has(dialog.id)) {
        old.delete(dialog.id);
      } else {
        old.add(dialog.id);
      }
      return old;
    });
  };

  return (
    <>
      <div style={{ width: '100%', height: '100%' }} onClick={() => linkOnClick(dialog.id)}>
        <p>{dialog.id}</p>
        <span className={nodecontrol}>
          <input
            type="checkbox"
            defaultChecked={always.has(dialog.id)}
            onChange={setAlwaysOnChange}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          Pin
        </span>
        <span className={nodecontrol}>
          <a href={`/bot/${projectId}/dialogs/${dialog.id}`} target="_parent">
            Open
          </a>
        </span>
      </div>
    </>
  );
};
