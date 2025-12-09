// This file is the main entry point of my React application.
// React will start running from here and show the <App /> component on the page.

import React from 'react'; 
import ReactDOM from 'react-dom/client';

// Importing my CSS file so global styles apply to the whole project
import './index.css';

// Importing the main component of my project
import App from './App';

// This file is optional and is used only for performance checking (not important for this project)
import reportWebVitals from './reportWebVitals';

// Importing Bootstrap CSS so I can use Bootstrap classes for design
import 'bootstrap/dist/css/bootstrap.min.css';

// Creating a root element where React will display everything.
// In public/index.html, there is a <div id="root"></div>.
// React uses that place to render the UI.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering my main App component inside the root.
// <React.StrictMode> helps me catch errors and warnings during development.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// This function measures app performance (optional).
// I am not using it for anything, but CRA includes it automatically.
reportWebVitals();
