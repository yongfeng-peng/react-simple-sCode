import React from './until/index.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 18
    };
  }
  handleClick = () => {
    console.log(this.state.age)
    this.setState({
      age: this.state.age + 1
    })
    console.log(this.state.age)
  }
  render() {
    return <div>
      <h1>{this.state.age}岁</h1>
      <button onClick={this.handleClick}>过生日</button>
    </div>
  }
}

export default React.transfer(App)