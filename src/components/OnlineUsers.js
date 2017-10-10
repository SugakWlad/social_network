import React from 'react';
import { connect } from 'react-redux';
import { Friend } from './Friends';


class OnlineUsers extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		if(this.props.onlineUsers){
			var onlineUsers = this.props.onlineUsers;
		}
		return (
			<div className="online-users">
				{!onlineUsers && <h3>No body is online</h3>}
				{!!onlineUsers && onlineUsers.map(user => <Friend first={user.first} last={user.last} img={user.image} id={user.id} />)}
			</div>
		)
	}
}

function mapStateToProps(state) {
    return {
        onlineUsers: state.onlineUsers
    };
};

export default connect(mapStateToProps)(OnlineUsers)