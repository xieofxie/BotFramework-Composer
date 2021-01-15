import React, { useState, useEffect } from 'react';

import { getSchemaUrlAsync, getUiSchemaUrlAsync, syncSchemas } from '../utilities/schemas';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({ schemaUrl: '', uiSchemaUrl: '' });
  const [log, setLog] = useState('Loading');

  const set = (name) => {
    return ({ target: { value } }) => {
      setValues((oldValues) => ({ ...oldValues, [name]: value }));
    };
  };

  const resetOnClick = async () => {
    setValues({ schemaUrl: await getSchemaUrlAsync(), uiSchemaUrl: await getUiSchemaUrlAsync() });
  };

  const syncOnClick = async () => {
    await syncSchemas(values.schemaUrl, values.uiSchemaUrl);
    setLog(`Sync on ${Date.now().toLocaleString()}`);
  };

  useEffect(() => {
    (async () => {
      await resetOnClick();
      setLog('');
      setLoading(false);
    })();
  }, []);

  return (
    <>
      {loading || (
        <>
          <p>
            Schema Url
            <input
              value={values.schemaUrl}
              onChange={(e) => {
                set('schemaUrl');
              }}
            ></input>
          </p>
          <p>
            UiSchema Url
            <input
              value={values.uiSchemaUrl}
              onChange={(e) => {
                set('uiSchemaUrl');
              }}
            ></input>
          </p>
          <p>
            <button onClick={resetOnClick}>Reset</button>
            <button onClick={syncOnClick}>Sync</button>
          </p>
        </>
      )}
      <p>{log}</p>
    </>
  );
};

export default Settings;
