import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { addMessage } from '../actions';
import axios from 'axios';
import { countToNull } from '../socket';


class Chat extends React.Component{
	constructor(props) {
		super(props);
		this.addMessage = this.addMessage.bind(this);
	}
	addMessage(e){
		if(e.keyCode === 13 && e.target.value.length > 0){
			var message = e.target.value;
			e.target.value = '';
			axios.post('/addMessage', {message: message});
		}
	}
	componentWillMount(){
		axios.get('/newChat').then(resp => {
			this.props.dispatch(addMessage(resp.data.messages));
		}) 
	}
	componentDidUpdate(){
		this.elem.scrollTop = this.elem.scrollHeight;
	}
	render(){
		countToNull();
		var messages = this.props.messages;
		return (
			<div className="chat">
				<div className="chat-cont" ref={elem => this.elem = elem}>
					{!!messages && messages.map(message => <Message img={message.image} first={message.first} last={message.last} message={message.message} id={message.id} />)}
				</div>
				<textarea className="chat-input" id="chat-input" name="newComment"  onKeyDown={e => this.addMessage(e)}></textarea>
			</div>
		)
			
	}
}

function Message({ img, first, last, message, id }){
	return (
		<div className="single-message-cont">
			<Link to={`user/${id}`}>
				<div>
					<img className="chat-image" src={img} />
				</div>
			</Link>
			<div className="single-message-info" style={{'border-bottom': 'none'}}>
				<h3>{first} {last}</h3>
				<p>{message}</p>
			</div>
		</div>
	)
}

function mapStateToProps(state){
	return {
		messages: state.chat
	}
}

export default connect(mapStateToProps)(Chat)
