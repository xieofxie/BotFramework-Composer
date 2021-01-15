import React from 'react';

import './App.scss';

const Links = [
  ['Botframework Composer', 'https://github.com/microsoft/BotFramework-Composer'],
  [
    'Adaptive Dialog',
    'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-adaptive-dialog-declarative?view=azure-bot-service-4.0',
  ],
];

const Introduction: React.FC = () => {
  return (
    <>
      <p className="App-header">Adaptive Dialog Visualizer</p>
      {Links.map((link) => {
        return (
          <p>
            <a href={link[1]} target="_blank" rel="noopener noreferrer">
              {link[0]}
            </a>
          </p>
        );
      })}
    </>
  );
};

export default Introduction;
