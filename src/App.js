import React, { Component } from 'react'
import io from 'socket.io-client' 
import PixelGrid from './PixelGrid.js'
import ColorSelect from './ColorSelect.js'
import { produce } from 'immer'
import OnlineCount from './OnlineCount.js'
import './App.css'

/*
* 放大 拖动 取色 限制绘制频率 在线人数
*批量更新 而不是单点更新
*PureComponent
*Hooks
*ReactDOM.createPotal
*socket.io
*canvas
*Jimp
*ArrayBuffer to image
*
*/ 
class App extends Component{
  constructor(props) {
    super(props)
    this.state = {
      currentColor: '#ffffff',
    }
    this.socket = io()
  }
  //发送网络请求和设置定时器应在componentDidMount阶段完成
  //因为此时dom已经渲染完成，可保证数据的正确加载
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      <h1 style={{textAlign: 'center'}}>画板</h1>
        <PixelGrid 
        currentColor={this.state.currentColor} 
        onPickColor={this.changeCurrentColor}
        socket={this.socket}/>
        <span id="color-pick-placeholder"></span>
        <ColorSelect onChange={this.changeCurrentColor} color={this.state.currentColor}/>
        <OnlineCount socket={this.socket}/>
      </div>
    )
  }
  
}

export default App;
