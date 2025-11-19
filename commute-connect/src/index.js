import React from 'react'; // Index.js file begining point for my React app, React is main liabary for builing Ui
import ReactDOM from 'react-dom/client'; // ReactDOm allows react to put things onto the web page/browser
import './index.css';  // CSS file for stylying
import App from './App'; // importing main app component
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(   // Rendering the main app component 
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
