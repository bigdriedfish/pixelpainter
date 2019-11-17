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
	top:0,
	transformOrigin:'top left'
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
		
			var a = oldZoomLevel
			var b = newZoomLevel
			var x = mouseLayerX
			var y = mouseLayerY
			var l1 = parseFloat(this.canvas.style.left)
			var t1 = parseFloat(this.canvas.style.top)

			// var l2 = (l1 * a - (b / a - 1) * x) / b //zoom属性放大
			// var t2 = (t1 * a - (b / a - 1) * x) / b //zoom属性放大
		
			var l2 = l1 - (b / a - 1) * x			//transform属性放大
			var t2 = t1 - (b / a - 1) * y    //transform属性放大
			
			
			this.canvas.style.left = l2 + 'px'
			this.canvas.style.top = t2 +'px'
			this.setState({
				zoomLevel: newZoomLevel
			})
			
			e.preventDefault()
		})
		this.setUpDragHandler()
	}

	setUpDragHandler = () => {
		var initialLeft
		var initialTop
		var mouseInitialX
		var mouseInitialY
		var dragging = false
		this.canvas.addEventListener('mousedown', e => {
			initialLeft = parseFloat(this.canvas.style.left)
			initialTop = parseFloat(this.canvas.style.top)
			mouseInitialX = e.clientX
			mouseInitialY = e.clientY
			dragging = true  
		}) 
		this.canvas.addEventListener('mousemove', e => {
			if (dragging) {
				var mouseX = e.clientX
				var mouseY = e.clientY
				var mouseMoveX = mouseX - mouseInitialX
				var mouseMoveY = mouseY - mouseInitialY
				var left = initialLeft + mouseMoveX 
				var top = initialTop + mouseMoveY
				this.canvas.style.left = left + 'px'
				this.canvas.style.top = top + 'px'
				
			}
		}) 
		this.canvas.addEventListener('mouseup', e => {
			dragging = false
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
					<canvas onClick={this.handleDotClick} 
					style={{...canvasStyle, 
						transform:'scale(' + this.state.zoomLevel + ')', 
						//zoom: this.state.zoomLevel
					}} ref={el => this.canvas = el}></canvas>
				</div>
			)
	}
	
}

export default PixelGrid