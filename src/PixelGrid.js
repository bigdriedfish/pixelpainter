import React, { Component } from 'react'

function createImageFromArrayBuffer(buf) {
	return new Promise(resolve => {
		var blob = new Blob([buf], {type:'image/png'})
		var image = new Image()
		var url = URL.createObjectURL(blob)
		image.onload = function() {
			resolve(image)
		}
		image.src = url 
	})
	
}

class PixelGrid extends Component {
	constructor(props) {
		super(props)

		this.socket = this.props.socket
		this.canvas = null
	}

	componentDidMount() {
		this.ctx = this.canvas.getContext('2d')
		this.canvas.style.imageRendering = 'pixelated'
		
		this.socket.on('initial-pixel-data', async pixelData => {
		
			var image = await createImageFromArrayBuffer(pixelData)
	
			this.canvas.width = image.width
			this.canvas.height = image.height

			this.ctx.drawImage(image, 0, 0)

		
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