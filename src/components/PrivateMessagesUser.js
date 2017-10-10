import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';


class PrivateMessagesUser extends React.Component{
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		console.log(this.props.params.id)		
	}
	// render(){
	// 	var users = this.props.privateChats
	// 	return (
	// 		<div className="chat">
	// 			{!users && <h4>You don't have any private chats</h4>}
	// 			<div className="chat-cont">
	// 				{!!users && users.map(user => <UsersToTalkUser img={user.image} first={user.first} last={user.last} message={user.message} id={user.id} />)}
	// 			</div>
	// 		</div>
	// 	)
	// }
}

function UsersToTalkUser({ img, first, last, message, id }){
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

function mapStateToProps(state) {
    return {
    	a: null
    };
};

export default connect(mapStateToProps)(PrivateMessagesUser)

