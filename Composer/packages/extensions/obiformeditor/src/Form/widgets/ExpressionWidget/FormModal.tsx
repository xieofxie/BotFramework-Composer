// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ExpressionType, getFunctionsByType, getTypeByFunction, getFunctionByName } from '@bfc/shared';
import { FunctionEntity } from '@bfc/lg-languageserver/lib/builtinFunctionsMap';

import { styles, dialogWindow } from './styles';

interface ExpressionStructure {
  type: ExpressionType | undefined;
  func: string | undefined;
  params: string[];
}

interface FormModalWidgetProps {
  value: string | undefined;
  isOpen: boolean;
  onSubmit: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, val: string) => void;
  onClose: () => void;
}

function parseExpression(expressionString): ExpressionStructure {
  if (!expressionString) {
    return { type: undefined, func: undefined, params: [] };
  }
  const firstBracketIndex = expressionString.indexOf('(');

  if (!firstBracketIndex) {
    return { type: undefined, func: undefined, params: [] };
  }

  const func = expressionString.substr(0, firstBracketIndex);
  const type = getTypeByFunction(func);
  const params: string[] = expressionString
    .substr(firstBracketIndex + 1, expressionString.length - 2 - firstBracketIndex)
    .split(',');

  return { type, func, params };
}

function assembelExpression(expressionSelectors: ExpressionStructure): string {
  let expressionString = `${expressionSelectors.func}(`;
  const paramLength = expressionSelectors.params?.length as number;
  expressionSelectors.params?.forEach((param, index) => {
    expressionString += param;
    if (index + 1 < paramLength) {
      expressionString += ', ';
    }
  });
  expressionString += ')';
  return expressionString;
}

function getTypeOptions(): IDropdownOption[] {
  const options: IDropdownOption[] = [];
  let i = 0;
  for (const type in ExpressionType) {
    if (isNaN(Number(type))) {
      options.push({ key: i, text: type });
      i++;
    }
  }
  return options;
}

function getFunctionOptions(type: ExpressionType | undefined): IDropdownOption[] {
  if (typeof type === 'undefined') {
    return [];
  }
  const options: IDropdownOption[] = [...getFunctionsByType(type).map(func => ({ key: func, text: func }))];
  return options;
}
export function FormModal(props: FormModalWidgetProps) {
  const { value, onSubmit, onClose, isOpen } = props;
  const [expressionSelectors, setExpressionSelectors] = useState<ExpressionStructure>({
    type: undefined,
    func: undefined,
    params: [],
  });
  const [functionOptions, setFunctionOptions] = useState<IDropdownOption[]>([]);
  const functionCategories = getTypeOptions();
  const [functionEntity, setFunctionEntity] = useState<FunctionEntity>();
  useEffect(() => {
    setExpressionSelectors(parseExpression(value));
  }, [value]);
  useMemo(() => {
    setFunctionOptions(getFunctionOptions(expressionSelectors.type));
  }, [expressionSelectors.type]);
  useMemo(() => {
    if (!expressionSelectors.func) {
      return;
    }
    setFunctionEntity(getFunctionByName(expressionSelectors.func));
  }, [expressionSelectors.func]);
  const onSelectCategory = (e, option) => {
    setExpressionSelectors({ ...expressionSelectors, type: option.key });
  };
  const onSelectFunction = (e, option) => {
    setExpressionSelectors({ ...expressionSelectors, func: option.key });
  };
  const updateParams = index => (e, newValue) => {
    const params = expressionSelectors.params;
    params[index] = newValue;
    setExpressionSelectors({ ...expressionSelectors, params });
  };
  const onClickSubmitBtn = e => {
    e.preventDefault();
    onSubmit(e, assembelExpression(expressionSelectors));
  };
  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onClose}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Expression builder'),
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      <div css={dialogWindow}>
        <Dropdown
          label={formatMessage('Function categories')}
          options={functionCategories}
          onChange={onSelectCategory}
          data-testid={'CategoryDropDown'}
          defaultSelectedKey={expressionSelectors.type}
        />
        <Dropdown
          label={formatMessage('Function')}
          options={functionOptions}
          onChange={onSelectFunction}
          data-testid={'FunctionDropDown'}
          defaultSelectedKey={expressionSelectors.func}
        />
        {functionEntity &&
          functionEntity.Params &&
          functionEntity.Params.map((param, index) => {
            return (
              <TextField
                key={`param${index + 1}`}
                label={formatMessage('params {index}', { index: index + 1 })}
                placeholder={param}
                value={expressionSelectors?.params[index]}
                onChange={updateParams(index)}
                data-testid={`param${index}`}
              />
            );
          })}
      </div>
      <DialogFooter>
        <DefaultButton onClick={onClose} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitBtn} text={formatMessage('Submit')} data-testid={'ExpressionFormSubmit'} />
      </DialogFooter>
    </Dialog>
  );
}
