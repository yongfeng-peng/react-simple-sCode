// import React from 'react';
// import ReactDOM from 'react-dom';

// let element = <h1 id='app'>学习吧</h1>;
// ReactDOM.render(element, document.getElementById('root'));

// import * as React from './until/index.js';

// let ReactDOM = React;

// let element = <div>
//   <h1>学习吧</h1>
//   <p>努力学习</p>
//   <a href="https://baidu.com">百度</a>
// </div>;

// ReactDOM.render(element, document.getElementById('root'));


import React from './until/index.js';
import App1 from './App'

let ReactDOM = React;

function App(props) {
  let [count, setCount] = React.useState(1);
  return <div>
    <h1>hello, { props.title },{count}</h1>
    <button onClick={() => setCount(count + 1)}>累加</button>
    <a href="https://baidu.com">百度</a>
    <hr/>
    <App1></App1>
  </div>;
}
let element = <App title='学习吧'></App>;
ReactDOM.render(element, document.getElementById('root'));
