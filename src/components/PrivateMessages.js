import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { getPrivateMessages } from '../actions';
import axios from 'axios';


class PrivateMessages extends React.Component{
	constructor(props) {
		super(props);
	}
	componentDidUpdate(){
		this.elem.scrollTop = this.elem.scrollHeight;
	}
	addMessage(e){
		if(e.keyCode === 13 && e.target.value.length > 0){
			var message = e.target.value;
			e.target.value = '';
			axios.post('/addPrivateMessage', {message: message, user: this.props.params.id}).then(resp => {
				this.props.dispatch(getPrivateMessages(resp.data.userMessages));
			})
		}
	}
	render(){
		if(location.pathname !== '/messages' && !this.props.privatMessages){
			axios.get(`/messagesWithUser/${this.props.params.id}`).then(resp => {
				this.props.dispatch(getPrivateMessages(resp.data.userMessages));
			})
		}
		if(location.pathname == '/messages'){
			this.props.dispatch(getPrivateMessages(null));
		}
		var messages = this.props.privatMessages
		var users = this.props.privateChats
		return (
			<div className="chat">
				{!users && <h4>You don't have any private chats</h4>}
				<div className="chat-cont" ref={elem => this.elem = elem}>
					{!!messages && location.pathname !== '/messages' && messages.map(messages => <UserMessages img={messages.image} first={messages.first} last={messages.last} message={messages.message} id={messages.id} />)}
					{!!users && location.pathname == '/messages' && users.map(user => <UsersToTalk img={user.image} first={user.first} last={user.last} message={user.message} id={user.id} />)}
				</div>
				{!!messages && location.pathname !== '/messages' && <textarea className="chat-input" id="chat-input" name="newComment"  onKeyDown={e => this.addMessage(e)}></textarea>}
			</div>
		)
	}
}

function UsersToTalk({ img, first, last, message, id }){
	return (
		<Link className="link" to={`/messages/${id}`}>
			<div className="single-message-cont">
				<div>
					<img className="chat-image" src={img} />
				</div>
				<div className="single-message-info">
					<h3>{first} {last}</h3>
					<p>{message}</p>
				</div>
			</div>
		</Link>
	)
}

function UserMessages({ first, last, img, message }){
	return (
		<div className="single-message-cont">
			<div>
				<img className="chat-image" src={img} />
			</div>
			<div className="single-message-info" style={{'border-bottom': 'none'}}>
				<h3>{first} {last}</h3>
				<pre>{message}</pre>
			</div>
		</div>
	)
}

function mapStateToProps(state) {
    return {
    	privateChats: state.privateChats,
    	privatMessages: state.privatMessages
    };
};

export default connect(mapStateToProps)(PrivateMessages)






