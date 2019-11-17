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

var canvasStyle = {
	display:'block',
	position:'absolute',
	left:0,
	top:0
}
class PixelGrid extends Component {
	constructor(props) {
		super(props)

		this.state = {
			zoomLevel:5,
		}

		this.socket = this.props.socket
		this.canvas = null
	}

	setUpZoomHandler = () => {
		this.canvas.addEventListener('mousewheel',e => {
			console.log(e)
			var mouseLayerX = e.layerX
			var mouseLayerY = e.layerY
			var oldZoomLevel = this.state.zoomLevel
			var  newZoomLevel
			if (e.deltaY < 0) {
				newZoomLevel = this.state.zoomLevel + 1
			}	else {
				newZoomLevel = this.state.zoomLevel - 1
			}

			var zoomRatio = newZoomLevel / oldZoomLevel
			var diffX = mouseLayerX * (zoomRatio - 1) / newZoomLevel
			var diffY = mouseLayerY * (zoomRatio - 1) / newZoomLevel
			this.canvas.style.left = parseInt(this.canvas.style.left) - diffX + 'px'
			this.canvas.style.top = parseInt(this.canvas.style.top) - diffY +'px'
			this.setState({
				zoomLevel: newZoomLevel
			
			})
			
			e.preventDefault()
		})
	}

	componentDidMount() {
		this.setUpZoomHandler()
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

		var row = Math.floor(layerY / this.state.zoomLevel)
		var col = Math.floor(layerX / this.state.zoomLevel)

		this.socket.emit('draw-dot', {row, col, color:this.props.currentColor})
	}
	render() {
			return (
				<div style={{margin: '220px',position:'relative',display:'inline-block', border:'1px solid',width: this.props.width, height:this.props.height, xoverflow:'hidden'}}> 
					<canvas onClick={this.handleDotClick} style={{...canvasStyle,zoom:this.state.zoomLevel}} ref={el => this.canvas = el}></canvas>
				</div>
			)
	}
	
}

export default PixelGrid