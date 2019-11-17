const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const app = express()
const Jimp = require('jimp')
const fs = require('fs')

const port = 3005

const server = app.listen(port, () => {
	console.log('server listening on port', port)
})

const io = socketIO(server)

//app.use(express.static(path, join(__dirname, './dist')))

const pixelData = new Jimp(20,20,0xffff00ff)

io.on('connection', async (socket) => {

	var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
	socket.emit('initial-pixel-data', pngBuffer)

	socket.on('draw-dot', async ({row, col, color}) => {
		var hexColor = Jimp.cssColorToHex(color)

		pixelData.setPixelColor(hexColor, col, row)
		socket.emit('update-dot', {row,col,color})

		var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
		fs.writeFile('./pixelData.png', buf, (err) => {
			if (err) {
				console.log(err)
			}	else {
				console.log('saved success')
			}
		})
	})
	socket.on('disconnect', () => {
		console.log('son leaves')
	})
})

