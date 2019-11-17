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
async function main() {
	const pixelData = await Jimp.read('./pixelData.png')

	let onlineCount = 0

	//进行批量更新
	let dotOperations = []
	setInterval(() => {
		if(dotOperations.length) {
			//服务器向所有客户端广播事件
			io.emit('update-dots', dotOperations)
			dotOperations = []
		}
	},100)

	io.on('connection', async (socket) => {
		onlineCount++
		io.emit('online-count', onlineCount)


		//将图片数据转换成二进制buffer
		var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
		var lastDrawTime = 0
		socket.emit('initial-pixel-data', pngBuffer)

		socket.on('draw-dot', async ({row, col, color}) => {
			//设置绘制间隔
			var now = Date.now()
			if (now - lastDrawTime < 3000) {
				return 
			}
			lastDrawTime = now

			//将字符串颜色转换为十六进制颜色
			var hexColor = Jimp.cssColorToHex(color)
			pixelData.setPixelColor(hexColor, col, row)

			dotOperations.push({row, col, color})

			//io.emit('update-dot', {row, col, color})
			

			try {
				var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
				await fs.promises.writeFile('./pixelData.png', buf)
				console.log('saved success')
			}	catch(e) {
				console.log(e)
			}
			})
		socket.on('disconnect', () => {
			onlineCount--
			console.log('someone leaves')
		})
	})
}
main()

