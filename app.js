const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const app = express()

const port = 3005

const server = app.listen(port, () => {
	console.log('server listening on port', port)
})

const io = sockerIO(server)

//app.use(express.static(path, join(__dirname, './dist')))

const pixelData = [
	['red','red','blue','white']
	['red','red','blue','white']
	['red','red','blue','white']
	['red','red','blue','white']
]

io.on('connection', (ws) => {
	ws.emit('pixel-data', pixelData)

	ws.on('disconnect', () => {
		console.log('son leaves')
	})
})

