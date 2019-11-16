import React, { Component } from 'react'

class PixelGrid extends Component {
	constructor(props) {
		super(props)

		this.socket = this.props.socket
		this.canvas = null
	}

	componentDidMount() {
		this.ctx = this.canvas.getContext('2d')
		this.canvas.style.imageRendering = 'pixelated'
		
		this.socket.on('initial-pixel-data', pixelData => {
			this.canvas.height = pixelData.length
			this.canvas.width = pixelData[0].length
			pixelData.forEach((row, rowIdx) => {
				row.forEach((color,colIdx) => {
					this.draw(rowIdx, colIdx, color)
				})
			})
		})

		this.socket.on('update-dot',({row, col, color}) => {
			this.draw(col, row, color)
		})
	}
	draw = (row, col, color) => {
		this.ctx.fillStyle = color
		this.ctx.fillRect(row, col, 1, 1)
	}
	handleDotClick = (e) => {
		console.log(e.nativeEvent)
		var layerX = e.nativeEvent.layerX
		var layerY = e.nativeEvent.layerY

		var row = Math.floor(layerY / 15)
		var col = Math.floor(layerX / 15)

		this.socket.emit('draw-dot', {row, col, color:this.props.currentColor})
	}
	render() {
			return (
				<div> 
					<canvas onClick={this.handleDotClick} style={{zoom:15}} ref={el => this.canvas = el}></canvas>
				</div>
			)
	}
	
}

export default PixelGrid