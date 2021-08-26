import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import RouteRoot from './routes/rootRoute'
import reportWebVitals from './reportWebVitals';

/* redux */
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import allReducer from './redux/reducers'


import th_TH from "antd/es/locale/th_TH";
import "moment/locale/th";

import { ConfigProvider } from 'antd';
import './assets/scss/main.scss';

const store = createStore(
  allReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()/*เอาออกกรณีระบบเสร็จสมบูรณ์*/
);
ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <ConfigProvider locale={th_TH}>
        <RouteRoot />
      </ConfigProvider>
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
