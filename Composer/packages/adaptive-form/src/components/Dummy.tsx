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

// Composer\packages\lib\code-editor\src\JsonEditor.tsx
const JsonEditor: React.FC<JsonEditorProps> = (props) => {
  return (
    <div>
      <p>JsonEditor is not supported</p>
      <p>{props.value}</p>
    </div>
  );
};

// Composer\packages\intellisense\src\components\Intellisense.tsx
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
    const textFieldValue = props.value;
    const focused = props.focused;
    const cursorPosition = -1;
    const onValueChanged = (newValue) => props.onChange(newValue);
    const onKeyDownTextField = (e) => {};
    const onKeyUpTextField = (e) => {};
    const onClickTextField = (e) => {};
    return (
      <div>
        {true || <p>Intellisense is not supported</p>}
        {props.children({
          textFieldValue,
          focused,
          cursorPosition,
          onValueChanged,
          onKeyDownTextField,
          onKeyUpTextField,
          onClickTextField,
        })}
      </div>
    );
  }
);

export { JsonEditor, Intellisense };
