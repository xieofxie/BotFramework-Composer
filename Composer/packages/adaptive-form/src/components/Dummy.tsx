import React from 'react';

interface JsonEditorProps {
  key?: any;
  height?: any;
  id?: any;
  editorSettings?: any;
  onBlur?: any;
  onFocus?: any;
  onChange: (jsonData: any) => void;
  value?: object;
  schema?: any;
  onError?: (error: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = (props) => {
  return <div></div>;
};

const Intellisense = React.memo(
  (props: {
    url: string;
    scopes: string[];
    projectId?: string;
    id: string;
    value?: any;
    focused?: boolean;
    completionListOverrideContainerElements?: HTMLDivElement[];
    completionListOverrideResolver?: (value: any) => JSX.Element | null;
    onChange: (newValue: string) => void;
    onBlur?: (id: string) => void;
    children: (renderProps: {
      textFieldValue: any;
      focused?: boolean;
      cursorPosition?: number;
      onValueChanged: (newValue: any) => void;
      onKeyDownTextField: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      onKeyUpTextField: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      onClickTextField: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    }) => JSX.Element;
  }) => {
    return <div></div>;
  }
);

export { JsonEditor, Intellisense };
