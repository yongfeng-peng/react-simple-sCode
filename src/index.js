// import React ,{useState} from 'react'
// import ReactDOM from 'react-dom'


// function App(props){
//   let [count,setCount] = useState(0)
//   return <div>
//     <h1>{props.title}</h1>
//     <p>{count}</p>
//     <button onClick={()=>setCount(count+1)}>add</button>
//   </div>
// }

// ReactDOM.render(<App title="开课吧" />, document.getElementById('root'))


// import React from './until'
// const ReactDOM = React



// class Demo extends React.Component{
//   constructor(props){
//     super(props)
//     this.state = {
//       count:1
//     }
//   }
//   handleClick = ()=>{
//     this.setState({
//       count:this.state.count+1
//     })
//   }
//   render(){
//     return <div>
//       <h2 onClick={this.handleClick}>{this.state.count}</h2>
//     </div>
//   }
// }
// Demo = React.useComponent(Demo)

// function App(props){
//   const [count, setCount] = React.useState(1)
//   return <div id="container" className="red">
//     <h1>{props.title}, {count}</h1>
//     <button onClick={()=>setCount(count+1)}>??</button>
//     <hr/>
//     <Demo></Demo>
//   </div>
// }
// let element = <App title="开课吧" />

// ReactDOM.render( element, document.getElementById('root'))

// 尝试
import React from './until'
import App1 from './App'

let ReactDOM = React;
// let element = <div id="container">
//   <h1>学习吧</h1>
//   <p>努力学习</p>
//   <a href="https://baidu.com">百度</a>
// </div>

// ReactDOM.render(
//   element,
//   document.getElementById('root')
// )

// function App(props){
//   return <div>
//     <h1>哈喽，{props.title}</h1>
//     <p onClick={() => alert(2)}>努力学习</p>
//     <a href="https://baidu.com">百度</a>
//   </div>
// }
// let element = <App title="开课吧" />;
// ReactDOM.render(element, document.getElementById('root'))

function App(props){
  let [count,setCount] = React.useState(1);
  return <div>
    <h1>{props.title}</h1>
    <p>{count}</p>
    <button onClick={()=>setCount(count+1)}>add</button>
    <hr/>
    <App1></App1>
  </div>
}
let element = <App title="开课吧" />;
ReactDOM.render(element, document.getElementById('root'))



// 阅读源码
// 解决问题
// 知其然知其所以然 源码的认识标示学习态度
// 算法  数据结构 学习优秀的源码
// 找到工作


// 学习方法：刻意练习

// 提高学习欲望
// 1.看你银行卡余额
// 2.看招聘jd