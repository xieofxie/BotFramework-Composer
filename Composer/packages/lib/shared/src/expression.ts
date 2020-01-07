// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { buildInfunctionsMap } from '@bfc/lg-languageserver';

// prebuild function type
export enum ExpressionType {
  StringFuntion,
  CollectionFuntion,
  LogicalComparisonFunction,
  ConversionFunction,
  MathFunction,
  DateTimeFunction,
  URIParseFunction,
  ObjectManipulationFunction,
  RegexFunction,
}

const TypesList = [
  {
    type: ExpressionType.StringFuntion,
    functions: [
      'length',
      'replace',
      'replaceIgnoreCase',
      'split',
      'substring',
      'toLower',
      'toUpper',
      'toLowerCase',
      'toUpperCase',
      'trim',
      'addOrdinal',
      'endsWith',
      'startsWith',
      'countWord',
      'concat',
      'newGuid',
      'indexOf',
      'lastIndexOf',
    ],
  },
  {
    type: ExpressionType.CollectionFuntion,
    functions: [
      'contains',
      'empty',
      'first',
      'join',
      'last',
      'count',
      'foreach',
      'union',
      'skip',
      'take',
      'intersection',
      'subArray',
      'select',
      'where',
      'sortBy',
      'sortByDescending',
      'indicesAndValues',
    ],
  },
  {
    type: ExpressionType.LogicalComparisonFunction,
    functions: ['and', 'or', 'equals', 'greater', 'greaterOrEquals', 'if', 'less', 'lessOrEquals', 'not', 'exists'],
  },
  {
    type: ExpressionType.ConversionFunction,
    functions: [
      'float',
      'int',
      'string',
      'bool',
      'createArray',
      'json',
      'array',
      'base64',
      'base64ToBinary',
      'base64ToString',
      'binary',
      'dataUri',
      'dataUriToString',
      'dataUriToBinary',
      'uriComponent',
      'uriComponentToString',
      'xml',
    ],
  },
  {
    type: ExpressionType.MathFunction,
    functions: ['add', 'div', 'max', 'min', 'mod', 'mul', 'rand', 'sub', 'sum', 'range', 'exp', 'average'],
  },
  {
    type: ExpressionType.DateTimeFunction,
    functions: [
      'addDays',
      'addHours',
      'addMinutes',
      'addSeconds',
      'dayOfMouth',
      'dayOfWeek',
      'dayOfYear',
      'formatDateTime',
      'subtractFromTime',
      'utcNow',
      'dateReadBack',
      'month',
      'date',
      'year',
      'getTimeOfDay',
      'getFutureTime',
      'getPastTime',
      'addToTime',
      'convertFromUTC',
      'convertToUTC',
      'startOfDay',
      'startOfHour',
      'startOfMonth',
      'ticks',
    ],
  },
  {
    type: ExpressionType.URIParseFunction,
    functions: ['uriHost', 'uriPath', 'uriPathAndQuery', 'uriPort', 'uriQuery', 'uriScheme'],
  },
  {
    type: ExpressionType.ObjectManipulationFunction,
    functions: [
      'addProperty',
      'removeProperty',
      'setProperty',
      'getProperty',
      'coalesce',
      'xPath',
      'jPath',
      'setPathToValue',
    ],
  },
  {
    type: ExpressionType.RegexFunction,
    functions: ['isMatch'],
  },
];

export const getFunctionsByType = (type: ExpressionType) => {
  const result = TypesList.filter(item => item.type === type);
  return result[0].functions;
};

export const getTypeByFunction = (func: string) => {
  const result = TypesList.find(item => item.functions.includes(func));
  return result?.type;
};

export const getFunctionByName = (name: string) => {
  return buildInfunctionsMap.get(name);
};
