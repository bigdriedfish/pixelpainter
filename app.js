const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const app = express()

const port = 3005

const server = app.listen(port, () => {
	console.log('server listening on port', port)
})

const io = socketIO(server)

//app.use(express.static(path, join(__dirname, './dist')))

const pixelData = [
	['red','red','blue','green'],
	['red','red','blue','green'],
	['red','red','blue','green'],
	['red','red','blue','green'],
]

io.on('connection', (socket) => {

	socket.emit('initial-pixel-data', pixelData)

	socket.on('draw-dot', ({row, col, color}) => {
		pixelData[row][col] = color
		socket.emit('update-dot', {row,col,color})
	})
	socket.on('disconnect', () => {
		console.log('son leaves')
	})
})

