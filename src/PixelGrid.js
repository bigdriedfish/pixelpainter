import React, { Component } from 'react'
import Dot from "./Dot.js"

class PixelGrid extends Component {
	constructor(props) {
		super(props)
	}

	handleDotClick = (row, col) => {
		this.props.onPixelClick(row, col)
	}
	render() {
		if (!this.props.pixels) {
			return null
		} else {
			return (
				<table style={{tableLayout:'fixed'}}>
					<tbody>
						{
							this.props.pixels.map((row,rowIdx) => (
								<tr key={rowIdx}>
									{row.map((color,colIdx) => (
										<Dot key = {colIdx} onClick={this.handleDotClick} color={color} row={rowIdx} col={colIdx}/>
									))}
								</tr>
							))
						}
					</tbody>
					
				</table>
			)
		}
	}
	
}

export default PixelGrid