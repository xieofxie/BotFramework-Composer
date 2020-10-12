// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useCallback, useState } from 'react';

import { render } from '@bfc/extension-client';

import axios from 'axios';

import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IColumn, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList';
import { GroupedList, IGroup } from 'office-ui-fabric-react/lib/GroupedList';
import { Selection, SelectionMode, SelectionZone } from 'office-ui-fabric-react/lib/Selection';
import { Stack, IStackProps, IStackStyles, IStackTokens } from 'office-ui-fabric-react/lib/Stack';
import { DefaultPalette } from 'office-ui-fabric-react/lib/Styling';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle, IToggleStyles } from 'office-ui-fabric-react/lib/Toggle';

import path = require('path');

const columns : IColumn[] = [
  {
    key: "name",
    name: "name",
    fieldName: "name",
    minWidth: 300
  }
];

class DicFile{
  key: string;
  path: string;
  name: string;
};

class DicFolder{
  path: string;
  name: string;
  // key: name
  folders: Map<string, DicFolder> = new Map<string, DicFolder>();
  files: DicFile[] = [];

  getFolder = (name: string) => {
    if (!this.folders.has(name)) {
      const folder = new DicFolder();
      folder.name = name;
      // folder.path = path.join(this.path, name);
      folder.path = this.path + "\\" + name;
      this.folders.set(name, folder);
    }
    return this.folders.get(name);
  }

  addFile = (name: string) => {
    const file = new DicFile();
    file.name = name;
    // file.path = path.join(this.path, name);
    file.path = this.path + "\\" + name;
    this.files.push(file);
  }
};

const convertToDictionary = (testFolder: string, testFiles: string[]) => {
  const root = new DicFolder();
  root.path = testFolder;
  // root.name = path.basename(testFolder);
  root.name = testFolder.split("\\").splice(-1)[0];
  testFiles.forEach(file => {
    // TODO weird. It uses POSIX now
    // const rel = path.relative(testFolder, file);
    const rel = file.substr(testFolder.length + 1);
    // const seps = rel.split(path.sep);
    const seps = rel.split('\\');
    let folder = root;
    for (let i = 0;i < seps.length - 1;i++) {
      folder = folder.getFolder(seps[i]);
    }
    folder.addFile(seps[seps.length - 1]);
  });
  return root;
};

// return count
const convertToItemsGroupsSub = (dicFolder: DicFolder, group: IGroup, items: DicFile[]) => {
  if (dicFolder.files.length > 0) {
    group.count += dicFolder.files.length;
    items.push(... dicFolder.files);
  }
  dicFolder.folders.forEach((value: DicFolder) => {
    const newGroup : IGroup = {
      count : 0,
      key: value.path,
      name: value.name,
      startIndex: items.length,
      children: [],
      level: group.level + 1
    };
    const childCount : number = convertToItemsGroupsSub(value, newGroup, items);
    group.count += childCount;
    group.children.push(newGroup);
  });
  return group.count;
};

const convertToItemsGroups = (root: DicFolder) => {
  const items : DicFile[] = [];
  const group : IGroup = {
    count : 0,
    key: root.path,
    name: root.name,
    startIndex: 0,
    children: [],
    level: 0
  };
  convertToItemsGroupsSub(root, group, items);
  const groups: IGroup[] = [ group ];
  console.error(items);
  console.error(groups);
  return { items, groups };
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const Main: React.FC<{}> = (props) => {
  const [projectId, setProjectId] = useState('');
  const [showList, setShowList] = useState(true);
  const [itemsGroups, setItemsGroups] = useState({items: [], groups: null});
  const selection = React.useMemo(
    () => {
      const selection = new Selection();
      selection.setItems(itemsGroups.items, true);
      return selection;
    },
    [itemsGroups]
  );

  const onRenderCell = (nestingDepth?: number, item?: DicFile, itemIndex?: number): React.ReactNode => {
    return <DetailsRow
      columns={columns}
      groupNestingDepth={nestingDepth}
      item={item}
      itemIndex={itemIndex}
      selection={selection}
      selectionMode={SelectionMode.multiple}
      compact={true}
    />;
  };

  const httpClient = axios.create({
    baseURL: "http://localhost:5000/testplugin",
  });

  const onRefreshClick = async () => {
    // TODO workaround
    setShowList(false);
    const filesRaw = await httpClient.get(`/${projectId}/files`);
    console.error(filesRaw.data.testFolder);
    console.error(filesRaw.data.testFiles.length);
    const root = convertToDictionary(filesRaw.data.testFolder, filesRaw.data.testFiles);
    const files = convertToItemsGroups(root);
    setItemsGroups(files);
    setShowList(true);
  };

  const onProjectIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    if (newValue) {
      setProjectId(newValue);
    }
  };

  return (
    <Stack horizontal>
      {showList && <SelectionZone selection={selection} selectionMode={SelectionMode.multiple}>
        <GroupedList
          items={itemsGroups.items}
          // eslint-disable-next-line react/jsx-no-bind
          onRenderCell={onRenderCell}
          selection={selection}
          selectionMode={SelectionMode.multiple}
          groups={itemsGroups.groups}
          compact={true}
        />
      </SelectionZone>}
      <Stack>
        <Stack horizontal verticalAlign={'end'}>
          <TextField label="ProjectId" onChange={onProjectIdChange} underlined />
          <DefaultButton text="Refresh" onClick={onRefreshClick} />
        </Stack>
        <Text>
          Test results are shown here.
        </Text>
        <TextField label="Content" multiline rows={3} />
      </Stack>
    </Stack>
  );
};

render(<Main />);
