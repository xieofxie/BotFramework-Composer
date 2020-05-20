// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { BotStatus } from './../../constants';

interface IWaitingProps {
  botStatus: BotStatus;
}

export const Waiting: React.FC<IWaitingProps> = props => {
  const { botStatus } = props;
  const publishing = botStatus === BotStatus.publishing;
  const reloading = botStatus === BotStatus.reloading;

  if (!publishing && !reloading) return null;
  return (
    <Spinner
      size={SpinnerSize.small}
      label={publishing ? formatMessage('Publishing') : formatMessage('Testing')}
      ariaLive="assertive"
      labelPosition="left"
      role="alert"
    />
  );
};
