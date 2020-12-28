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


// import React from './until/index.js';
// import App1 from './App'

// let ReactDOM = React;

// function App(props) {
//   // Hook 是 React 16.8 的新增特性,它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性
//   let [count, setCount] = React.useState(1); // 数组解构
//   return <div>
//     <h1>hello, { props.title },{count}</h1>
//     <button onClick={() => setCount(count + 1)}>累加</button>
//     <a href="https://baidu.com">百度</a>
//     <hr/>
//     <App1/>
//   </div>;
// }
// let element = <App title='学习吧'></App>;
// ReactDOM.render(element, document.getElementById('root'));


// 学习hooks
import React, { useState, useEffect, useContext, useReducer } from 'react';
import ReactDOM from 'react-dom';

const AppContext = React.createContext({}); // 使用 React Context API，在组件外部建立一个 Context。

// useContext()：共享状态钩子
const Navbar = () => {
  const { username } = useContext(AppContext); // useContext()钩子函数用来引入 Context 对象，从中获取username属性。
  return (
    <div>
      <p>AwesomeSite</p>
      <p>{username}</p>
    </div>
  )
}

const Messages = () => {
  const { username } = useContext(AppContext)
  return (
    <div>
      <h1>Messages</h1>
      <p>1 message for {username}</p>
    </div>
  )
}

const myReducer = (state, action) => {
  switch(action.type) {
    case('countUp'):
      return {
        ...state,
        count: state.count + 1
      }
    default:
      return state
  }
}

function App(props) {
  // Hook 是 React 16.8 的新增特性,它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性
  let [count, setCount] = useState(1); // 数组解构

  useEffect(() => {
    document.title = `you click ${count} times`;
  },)
  const [varA, setVarA] = useState(0);
  const [varB, setVarB] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setVarA(varA + 1), 1000);
    return () => clearTimeout(timeout);
  }, [varA]);

  useEffect(() => {
    const timeout = setTimeout(() => setVarB(varB + 2), 2000);

    return () => clearTimeout(timeout);
  }, [varB]);

  // 数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用
  // 如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合
  // React 组件中有两种常见副作用操作：需要清除的和不需要清除的
  // 无需清除的操作: 在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求，手动变更 DOM，记录日志
  // 需要清除的操作: 订阅外部数据源
  // 每个 effect 都可以返回一个清除函数
  // React 会在组件卸载的时候执行清除操作

  // Effect Hook 可以让你在函数组件中执行副作用操作
  // 以上代码等价于
  // let countStateVariable = React.useState(1); // 返回一个有两个元素的数组
  // let count = countStateVariable[0]; // 数组里的第一个值 当前的state
  // let setCount = countStateVariable[1]; // 数组里的第二个值 更新state的函数
  // 使用 [0] 和 [1] 来访问有点令人困惑，因为它们有特定的含义。这就是我们使用数组解构的原因。
  // 你不必使用多个 state 变量。State 变量可以很好地存储对象和数组，因此，你仍然可以将相关数据分为一组。然而，不像 class 中的 this.setState，更新 state 变量总是替换它而不是合并它。
  
  // AppContext.Provider提供了一个 Context 对象，这个对象可以被子组件共享

  // useReducer()：action 钩子
  const [state, dispatch] = useReducer(myReducer, { count: 0 })

  return <div>
    <h1>hello, { props.title },{count}</h1>
    <button onClick={() => setCount(count + 1)}>累加</button>
    <a href="https://baidu.com">百度</a>
    <hr/>
    <span>{varA}, {varB}</span>;
    <hr/>
    <AppContext.Provider value={{
      username: 'hello world!'
    }}>
      <div>
        <Navbar />
        <Messages />
      </div>
    </AppContext.Provider>
    <hr/>
    <div>
      <button onClick={() => dispatch({ type: 'countUp' })}>
        +1
      </button>
      <p>Count: {state.count}</p>
    </div>
  </div>;
}
let element = <App title='学习吧'></App>;
ReactDOM.render(element, document.getElementById('root'));
