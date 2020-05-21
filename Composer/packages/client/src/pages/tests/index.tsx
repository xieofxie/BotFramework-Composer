// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { globalHistory, RouteComponentProps } from '@reach/router';
import { PromptTab } from '@bfc/shared';
import { DialogFactory, SDKKinds, DialogInfo } from '@bfc/shared';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TestsController } from '../../components/TestsController';
import { createSelectedPath } from '../../utils';
import { Conversation } from '../../components/Conversation';
import { ProjectTree } from '../../components/ProjectTree';
import { StoreContext } from '../../store';
import { ToolBar } from '../../components/ToolBar/index';
import { clearBreadcrumb } from '../../utils/navigation';
import { navigateTo } from '../../utils';
import { contentWrapper, editorContainer, editorWrapper, pageRoot, visualPanel } from '../design/styles';
import { PropertyEditor } from '../design/PropertyEditor';

const CreateTestModal = React.lazy(() => import('./createTestModal'));

const getTabFromFragment = () => {
  const tab = window.location.hash.substring(1);

  if (Object.values<string>(PromptTab).includes(tab)) {
    return tab;
  }
};

const TestsPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string }>> = props => {
  const { state, actions } = useContext(StoreContext);
  const { testDialogs, breadcrumb, projectId, schemas, focusPath, designPageLocation } = state;
  const {
    setDesignPageLocation,
    navToTest,
    selectToTest,
    setectAndfocus,
    clearUndoHistory,
    onboardingAddCoachMarkRef,
  } = actions;
  const { location, dialogId } = props;
  const params = new URLSearchParams(location?.search);
  const selected = params.get('selected') || '';
  const [, setTriggerModalVisibility] = useState(false);
  const [] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(testDialogs[0]);
  const [, setExportSkillModalVisible] = useState(false);

  useEffect(() => {
    const currentDialog = testDialogs.find(({ id }) => id === dialogId);
    if (currentDialog) {
      setCurrentDialog(currentDialog);
    }
    const rootDialog = testDialogs.find(({ isRoot }) => isRoot === true);
    if (!currentDialog && rootDialog) {
      const { search } = location || {};
      navigateTo(`/bot/${projectId}/tests/${rootDialog.id}${search}`);
      return;
    }
  }, [dialogId, testDialogs, location]);

  useEffect(() => {
    const index = currentDialog.triggers.findIndex(({ type }) => type === SDKKinds.OnBeginDialog);
    if (index >= 0 && !designPageLocation.selected) {
      selectToTest(createSelectedPath(index));
    }
  }, [currentDialog?.id, designPageLocation]);

  useEffect(() => {
    if (location && props.dialogId && props.projectId) {
      const { dialogId, projectId } = props;
      const params = new URLSearchParams(location.search);
      setDesignPageLocation({
        dialogId: dialogId,
        projectId: projectId,
        selected: params.get('selected'),
        focused: params.get('focused'),
        breadcrumb: location.state ? location.state.breadcrumb || [] : [],
        onBreadcrumbItemClick: handleBreadcrumbItemClick,
        promptTab: getTabFromFragment(),
      });
      // @ts-ignore
      globalHistory._onTransitionComplete();
    } else {
      //leave design page should clear the history
      clearUndoHistory();
    }
  }, [location]);

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  function handleSelect(id, selected = '') {
    if (selected) {
      throw 'should never happen';
      selectToTest(selected);
    } else {
      navToTest(id);
    }
  }

  const onCreateDialogComplete = newDialog => {
    if (newDialog) {
      navToTest(newDialog);
    }
  };

  const toolbarItems = [
    {
      type: 'action',
      text: formatMessage('Add'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => actions.createDialogBegin([], onCreateDialogComplete),
      },
      align: 'left',
    },
    {
      type: 'element',
      element: <TestsController dialogId={currentDialog.id} />,
      align: 'right',
    },
  ];

  function handleBreadcrumbItemClick(_event, item) {
    if (item) {
      const { dialogId, selected, focused, index } = item;
      setectAndfocus(dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
    }
  }

  async function handleCreateDialogSubmit(data: { name: string; description: string }) {
    let name = data.name;
    let index = name.lastIndexOf('/');
    if (index != -1) {
      name = name.substr(index + 1);
    }

    const seededContent = {
      $schema: "https://raw.githubusercontent.com/microsoft/BotFramework-Composer/stable/Composer/packages/server/schemas/sdk.schema",
      $kind: "Microsoft.Test.Script",
      description: data.description,
    };

    await actions.createTest({ id: name, name: data.name, content: seededContent });
  }

  async function handleDeleteDialog() {}

  async function handleDeleteTrigger() {}

  if (!dialogId) {
    return <LoadingSpinner />;
  }

  return (
    <React.Fragment>
      <div css={pageRoot}>
        <ProjectTree
          dialogs={testDialogs}
          dialogId={dialogId}
          selected={selected}
          onSelect={handleSelect}
          onDeleteDialog={handleDeleteDialog}
          onDeleteTrigger={handleDeleteTrigger}
        />
        <div role="main" css={contentWrapper}>
          <ToolBar
            toolbarItems={toolbarItems}
            actions={actions}
            projectId={projectId}
            currentDialog={currentDialog}
            openNewTriggerModal={openNewTriggerModal}
            onCreateDialogComplete={onCreateDialogComplete}
            onboardingAddCoachMarkRef={onboardingAddCoachMarkRef}
            showSkillManifestModal={() => setExportSkillModalVisible(true)}
          />
          <Conversation css={editorContainer}>
            <div css={editorWrapper}>
              <div css={visualPanel}>
                {
                  <JsonEditor
                    key={'testdialogjson'}
                    id={currentDialog.id}
                    onChange={data => {
                      if (!currentDialog.luFile) {
                        actions.updateDialog({ id: currentDialog.id, projectId, content: data });
                      }
                    }}
                    value={currentDialog.content || undefined}
                    schema={schemas.sdk.content}
                  />
                }
              </div>
              <PropertyEditor key={focusPath} />
            </div>
          </Conversation>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        {state.showCreateDialogModal && (
          <CreateTestModal
            isOpen={state.showCreateDialogModal}
            onDismiss={() => actions.createDialogCancel()}
            onSubmit={handleCreateDialogSubmit}
          />
        )}
      </Suspense>
    </React.Fragment>
  );
};

export default TestsPage;
