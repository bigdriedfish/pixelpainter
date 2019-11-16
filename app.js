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
	['red','red','blue','white'],
	['red','red','blue','white'],
	['red','red','blue','white'],
	['red','red','blue','white'],
]

var clients = []

io.on('connection', (socket) => {
	clients.push(socket)

	socket.emit('pixel-data', pixelData)

	socket.on('draw-dot', ({row, col, color}) => {
		pixelData[row][col] = color
		socket.emit('update-dot', {row,col,color})
		// clients.forEach(client => {
		// 	client.emit('update-dot', {row, col, color})
		// })
	})
	socket.on('disconnect', () => {
		clients = clients.filter(it => it != socket)
		console.log('son leaves')
	})
})

