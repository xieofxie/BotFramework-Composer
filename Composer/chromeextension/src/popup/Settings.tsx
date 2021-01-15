import React, { useState, useEffect } from 'react';

import { getSchemaUrlAsync, getUiSchemaUrlAsync, syncSchemas, getSchemaTimeAsync } from '../utilities/schemas';
import { settingsLabelStyle, settingsInputStyle, settingsLIStyle } from '../utilities/styles';

const getTimeString = async (): Promise<string> => {
  const time = await getSchemaTimeAsync();
  return time ? `Sync on ${time.toLocaleString()}` : `Sync on N/A`;
}

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
    setLog(await getTimeString());
  };

  const syncOnClick = async () => {
    await syncSchemas(values.schemaUrl, values.uiSchemaUrl);
    setLog(await getTimeString());
  };

  useEffect(() => {
    (async () => {
      await resetOnClick();
      setLoading(false);
    })();
  }, []);

  return (
    <>
      {loading || (
        <>
          <p className={settingsLIStyle}>
            <label className={settingsLabelStyle}>Schema Url</label>
            <input className={settingsInputStyle} value={values.schemaUrl} onChange={set('schemaUrl')}></input>
          </p>
          <p className={settingsLIStyle}>
            <label className={settingsLabelStyle}>UiSchema Url</label>
            <input className={settingsInputStyle} value={values.uiSchemaUrl} onChange={set('uiSchemaUrl')}></input>
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
