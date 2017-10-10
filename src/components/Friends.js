import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FriendButton } from './FriendButton';
import { receiveFriends } from '../actions';



class Friends extends React.Component{
	constructor(props) {
		super(props);
		
	}
	componentDidMount(){
		this.props.dispatch(receiveFriends());
	}
	render(){
		if(this.props.waitings && this.props.friends){
			if(this.props.waitings.length > 0){
				var waitings = this.props.waitings;
			}
			if(this.props.friends.length > 0){
				var friends = this.props.friends;
			}
		}
		return (
			<div className="friends-cont">
				<h2>This people are waiting</h2>
				<div className="friends-list">
					{!!waitings && waitings.map(user => <Friend first={user.first} last={user.last} img={user.image} id={user.id} />)}
					{!waitings && <h3>No body is waiting</h3>}
				</div>
				<h2>This people are your friends</h2>
				<div className="friends-list">
					{!!friends && friends.map(user => <Friend first={user.first} last={user.last} img={user.image} id={user.id} />)}
					{!friends && <h3>You have no friends</h3>}
				</div>
			</div>
		)
	}
}

export function Friend({ first, last, img, id }){
	return (
		<div className="friends">
			<Link to={`user/${id}`}>
				<div className="friend-image-cont">
					<img className="friend-image" src={img} />
				</div>
			</Link>
			<div>
				<h2>{first} {last}</h2>
				<div>
					<FriendButton id={id}/>
				</div>
			</div>
		</div>
	)
}

function mapStateToProps(state) {
    return {
        waitings: state.waitings,
        friends: state.friends
    };
};

export default connect(mapStateToProps)(Friends)
