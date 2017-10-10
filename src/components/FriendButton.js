import React from 'react';
import axios from 'axios';

export class FriendButton extends React.Component{
	constructor(props) {
		super(props);
		this.state = {

		}
		this.add = this.add.bind(this);
		this.delete = this.delete.bind(this);
		this.accept = this.accept.bind(this);
	}
	componentDidMount(){
		axios.get('/status', {
			params: {
				id: this.props.id
			}
		}).then(resp => {
			this.setState({
				status: resp.data.status,
				senderMe: resp.data.sender
			})
		})
	}
	add(){
		axios.post('/addfriend', {
			recipient: this.props.id,
			status: 2
		}).then(resp => {
			this.setState({
				status: resp.data.status,
				senderMe: resp.data.sender
			})
		})
	}
	delete(){
		axios.post('/deletefriend', {
			recipient: this.props.id
		}).then(resp => {
			this.setState({
				status: resp.data.status
			})
		})
	}
	accept(){
		axios.post('/acceptfriend', {
			recipient: this.props.id,
			status: 1
		}).then(resp => {
			this.setState({
				status: resp.data.status
			})
		})
	}
	render(){
		return (
			<div className="friend-button-cont">
				{this.state.status == null && <button onClick={this.add}>Friend Request</button>}
				{this.state.status == 2 && this.state.senderMe && <button onClick={this.delete}>Cancel Request</button>}
				{this.state.status == 2 && !this.state.senderMe && <div className="friend-button-cont"><button onClick={this.accept}>Accept</button><button onClick={this.delete}>Deny</button></div>}
				{this.state.status == 1 && <button onClick={this.delete}>Unfriend</button>}
			</div>
		)
	}
}