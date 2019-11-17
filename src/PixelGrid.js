import React, { Component } from 'react'
import ReactDOM from 'react-dom'

//图片转成二进制数据
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

//获取鼠标当前位置
function getMousePos(e) {
  var layerX = e.layerX
  var layerY = e.layerY
  var zoom = e.target.style.transform.match(/scale\((.*?)\)/)[1]
  return [
    Math.floor(layerX / zoom),
    Math.floor(layerY / zoom),
  ]
}

var canvasStyle = {
	display:'block',
	xposition:'absolute',
	transformOrigin:'top left',
	isPickingColor:false,
}

class PixelGrid extends Component {
	constructor(props) {
		super(props)
		this.state = {
			zoomLevel:0.5,
			dotHoverX: -1,
			dotHoverY: -1,
			width:0,
			height:0
		}
		this.socket = this.props.socket
		this.canvas = null
	}
	//设置放大
	setUpZoomHandler = () => {
		this.canvas.addEventListener('mousewheel',e => {
			console.log(e)
			var mouseLayerX = e.layerX
			var mouseLayerY = e.layerY
			var oldZoomLevel = this.state.zoomLevel
			var  newZoomLevel
			if (e.deltaY < 0) {
				newZoomLevel = this.state.zoomLevel + 0.5
			}	else {
				newZoomLevel = this.state.zoomLevel - 0.5
			}
			
		
			var a = oldZoomLevel
			var b = newZoomLevel
			var x = mouseLayerX
			var y = mouseLayerY
			var l1 = parseFloat(this.canvasWrapper.style.left)
			var t1 = parseFloat(this.canvasWrapper.style.top)

			// var l2 = (l1 * a - (b / a - 1) * x) / b //zoom属性放大
			// var t2 = (t1 * a - (b / a - 1) * x) / b //zoom属性放大
			if (newZoomLevel < 1) {
				newZoomLevel = 1
				l2 = 0
				t2 = 0
			}
			var l2 = l1 - (b / a - 1) * x			//transform属性放大
			var t2 = t1 - (b / a - 1) * y    //transform属性放大
			
			
			this.canvasWrapper.style.left = l2 + 'px'
			this.canvasWrapper.style.top = t2 +'px'
			this.setState({
				zoomLevel: newZoomLevel
			})
			
			e.preventDefault()
		})	
	}
	//设置拖拽
	setUpDragHandler = () => {
		var initialLeft
		var initialTop
		var mouseMoveX 
		var mouseMoveY 
		var mouseInitialX
		var mouseInitialY
		var dragging = false
		this.canvasWrapper.addEventListener('mousedown', e => {
		
			initialLeft = parseFloat(this.canvasWrapper.style.left)
			initialTop = parseFloat(this.canvasWrapper.style.top)
			mouseInitialX = e.clientX
			mouseInitialY = e.clientY
			dragging = true  
		}) 
		//定位span
		this.canvas.addEventListener('mousemove', e => {
			
			var y = Math.floor(e.layerY / this.state.zoomLevel)
			var x = Math.floor(e.layerX / this.state.zoomLevel)
			this.setState({
				dotHoverX:x,
				dotHoverY:y,
			})
		})
		window.addEventListener('mousemove', e => {
			
			if (dragging) {
				var mouseX = e.clientX
				var mouseY = e.clientY

				mouseMoveX = mouseX - mouseInitialX
				mouseMoveY = mouseY - mouseInitialY
				
				var left = initialLeft + mouseMoveX 
				var top = initialTop + mouseMoveY
				this.canvasWrapper.style.left = left + 'px'
				this.canvasWrapper.style.top = top + 'px'
				
			}
		}) 
		window.addEventListener('mouseup', e => {
			
			dragging=false
		})
		this.canvasWrapper.addEventListener('mouseup', e => {
			
			dragging = false
			var moveDistance = Math.sqrt(mouseMoveX * mouseMoveX + mouseMoveY * mouseMoveY)
			console.log(moveDistance )
			if (moveDistance < 50 && !this.state.isPickingColor) {
				console.log('draw dots')
				this.handleDotClick(e)
			}
		}) 
		
	}
	//设置取色
	setUpPickColorHandler = () => {
		//实现取色光标形式
		function makeCursor(color) {
      var cursor = document.createElement('canvas')
      var ctx = cursor.getContext('2d');
      cursor.width = 41;
      cursor.height = 41;
  
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.moveTo(0, 6);
      ctx.lineTo(12, 6);
      ctx.moveTo(6, 0);
      ctx.lineTo(6, 12);
      ctx.stroke();
  
      ctx.beginPath();
      ctx.arc(25, 25, 14, 0, 2 * Math.PI, false);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(25, 25, 13.4, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      
      return cursor.toDataURL()
		}
		//点击取色
		this.canvas.addEventListener('mousemove', e => {
			if (this.state.isPickingColor) {
				var [x, y] = getMousePos(e)
				var pixelColor = Array.from(this.ctx.getImageData(x, y, 1, 1).data)
				var pixelColorCss = 'rgba(' + pixelColor + ')'
				var cursorUrl = makeCursor(pixelColorCss)
				this.canvas.style.cursor = `url(${cursorUrl}) 6 6, crosshair`
			}
		})
		this.canvas.addEventListener('click', e => {
			if (this.state.isPickingColor) {
				var [x, y] = getMousePos(e)
					var pixelColor = Array.from(this.ctx.getImageData(x, y, 1, 1).data)
					var hexColor = '#' + pixelColor.slice(0,3).map(it => {
						return it.toString(16).padStart(2, '0')
					}).join('')
					this.props.onPickColor(hexColor)
					this.setState({
						isPickingColor:false
					})
					this.canvas.style.cursor = ''
			}
			
		})
	}
	//设置点击画点
	handleDotClick = (e) => {
		var layerX = e.layerX
		var layerY = e.layerY
	
		var row = Math.floor(layerY / this.state.zoomLevel)
		var col = Math.floor(layerX / this.state.zoomLevel)
		
		this.socket.emit('draw-dot', {row, col, color:this.props.currentColor})
	}

	componentDidMount() {
		this.setUpZoomHandler()
		this.setUpDragHandler()
		this.setUpPickColorHandler()

		this.ctx = this.canvas.getContext('2d')
		this.canvas.style.imageRendering = 'pixelated'
		

		this.socket.on('initial-pixel-data', async pixelData => {
		
			var image = await createImageFromArrayBuffer(pixelData)
	
			this.canvas.width = image.width
			this.canvas.height = image.height

			this.setState({
				width:image.width,
				height:image.height,
			})
			this.ctx.drawImage(image, 0, 0)
			this.forceUpdate()
		
		})

		this.socket.on('update-dots',(dots) => {
			dots.forEach(({col, row, color}) => {
				this.draw(col, row, color)
			})
		})
	}
	//画点
	draw = (row, col, color) => {
		this.ctx.fillStyle = color
		this.ctx.fillRect(row, col, 1, 1)
	}

	setPickColor = () => {
		this.setState({
			isPickingColor:true
		})
	}
	//取色button实现
	renderPickColorBtn() {
		var el = document.getElementById('color-pick-placeholder')
		if (!el) {
			return null
		}	else {
			return ReactDOM.createPortal((
				<button onClick={this.setPickColor} style={{
					display:'block',
					marginLeft:'-55px'
				}}>{
					this.state.isPickingColor ? "正在取色" : "取色"
				}</button>
			),el)
		}
	}
	render() {
			return (
				<div style={{
					margin: '60px',
					position:'relative',
					display:'inline-block', 
					border:'1px solid',
					width: this.state.width/2, 
					height:this.state.height/2, 
					overflow:'hidden'}}> 
					{this.renderPickColorBtn()}
				<div ref={el => this.canvasWrapper = el} className='canvas-wrapper' style={{
					position:'absolute',
					left:0,
					top:0,
				}}>
					<span className="dot-hover-box" style={{
						boxShadow:'0 0 2px black',
						width: this.state.zoomLevel + 'px',
						height:this.state.zoomLevel + 'px',
						position:'absolute',
						left:this.state.dotHoverX * this.state.zoomLevel + 'px',
						top:this.state.dotHoverY * this.state.zoomLevel + 'px',
						zIndex:5,
						pointerEvents:'none'
					}}></span>
					<canvas style={{...canvasStyle, 
						transform:'scale(' + this.state.zoomLevel + ')', 
						//zoom: this.state.zoomLevel
					}} ref={el => this.canvas = el}></canvas>
					</div>
				</div>
			)
	}
	
}
export default PixelGrid
//还有一个小问题，点不上点的问题出在距离的计算上，不知道怎么改了