import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { FriendButton } from './FriendButton';
import { receiveFriends } from '../actions';

class OtherProfile extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			userImg: "/static/images/default_user.png"
		}	
	}
	componentDidMount(){
		axios.get('/user', {
			params: {
				id: this.props.params.id
			}
		}).then(resp => {
			if(resp.data.success){
				if(resp.data.image){
					this.setState({
						userImg: resp.data.image
					})

				}
				if(resp.data.bio){
					this.setState({
						bio: resp.data.bio
					})
				}
				this.setState({
					first: resp.data.first,
					last: resp.data.last
				})
			}
		})
	}
	render(){
		return (
			<div className="user-cont">
				<div className="user-img-cont">
					<img className="user-img" src={this.state.userImg} />
					<FriendButton id={this.props.params.id} />
				</div>
				<div className="user-info">
					<h2>{this.state.first} {this.state.last}</h2>
					{this.state.bio && <p>{this.state.bio}</p>}
					{!this.state.bio && <p>Still no bio</p>}
					<Link to={`/messages/${this.props.params.id}`}>Write a message</Link>
				</div>

			</div>
		)
	}
}

function mapStateToProps(state) {
    return {
        friends: state.friends
    };
};

export default connect(mapStateToProps)(OtherProfile)

