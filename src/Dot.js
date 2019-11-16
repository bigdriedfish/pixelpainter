import React, { Component } from "react"



function Dot(props) {
	return <td onClick={props.onClick} style={{width:'5px',height:'5px',backgroundColor:props.color}}></td>
}

export default Dot