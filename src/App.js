// import React from 'react';
import React from './until';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 18
    }
  }
  handleClick = () => {
    this.setState({
      age: this.state.age + 1
    })
  }
  render() {
    return <div>
      <h1>今年{this.state.age}岁</h1>
      <button onClick={this.handleClick}></button>
    </div>
  }
}

export default React.transfer(App);

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
