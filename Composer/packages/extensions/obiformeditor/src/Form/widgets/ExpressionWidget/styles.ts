// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';

export const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '256px !important',
    },
  },
};

export const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 300px;
`;
