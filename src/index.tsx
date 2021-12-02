import React from 'react';
import ReactDOM from 'react-dom';
import {Description, Header} from './components'
import '../css/tailwind.css';

ReactDOM.render(
  <React.StrictMode>
    <div className="bg-gray-800 p-8">
        <Header />
        <Description />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

