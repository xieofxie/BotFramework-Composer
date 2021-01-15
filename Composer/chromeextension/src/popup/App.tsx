import React, { useState } from 'react';

import './App.scss';
import Introduction from './Introduction';
import Settings from './Settings';
import About from './About';

enum Tab {
  Introduction,
  Settings,
  About,
}

function App() {
  const [tab, setTab] = useState(Tab.Introduction);

  return (
    <div className="App">
      <p>
        <button
          onClick={() => {
            setTab(Tab.Introduction);
          }}
        >
          Intro
        </button>
        <button
          onClick={() => {
            setTab(Tab.Settings);
          }}
        >
          Settings
        </button>
        <button
          onClick={() => {
            setTab(Tab.About);
          }}
        >
          About
        </button>
      </p>
      {tab == Tab.Introduction ? <Introduction></Introduction> : null}
      {tab == Tab.Settings ? <Settings></Settings> : null}
      {tab == Tab.About ? <About></About> : null}
    </div>
  );
}

export default App;
