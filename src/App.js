import React, { Component} from 'react'
import io from 'socket.io-client' 
import PixelGrid from './PixelGrid.js'
import ColorSelect from './ColorSelect.js'
import { produce } from 'immer'
import './App.css'


class App extends Component{
  constructor(props) {
    super(props)
    this.state = {
      currentColor: 'red',
    }
    this.socket = io('ws://localhost:3005/')
  }

  componentDidMount() {
    
  }
  handlePixelClick = (row, col) => {
  }
  changeCurrentColor = (color) => {
    console.log(color)
    this.setState({
      currentColor:color
    })
  }
  render() {
    return (
      <div>
        <PixelGrid currentColor={this.state.currentColor} 
        socket={this.socket}/>
        <ColorSelect onChange={this.changeCurrentColor} color={this.state.currentColor}/>
      </div>
    )
  }
  
}

export default App;
