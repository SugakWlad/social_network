import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { ProfilePicUpload } from './ProfilePicUpload';


class App extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			userImg: "/static/images/default_user.png",
			showProfilePicUpload: false
		}
		this.showProfilePicUpload = this.showProfilePicUpload.bind(this);
		this.setNewBio = this.setNewBio.bind(this);
		this.logout = this.logout.bind(this);
	}
	componentWillMount(){
		axios.get('/user').then(resp => {
			if(resp.data.success){
				if(resp.data.image !== null && resp.data.bio !== null){
					this.setState({
						userImg: resp.data.image,
						bio: resp.data.bio,
						first: resp.data.first,
						last: resp.data.last
					})
				}else if(resp.data.image == null && resp.data.bio !== null){
					this.setState({
						bio: resp.data.bio,
						first: resp.data.first,
						last: resp.data.last
					})
				}else if(resp.data.image !== null && resp.data.bio == null){
					this.setState({
						userImg: resp.data.image,
						first: resp.data.first,
						last: resp.data.last
					})
				}else{
					this.setState({
						first: resp.data.first,
						last: resp.data.last
					})
				}
			}
		})
	}
	showProfilePicUpload(){
		if(!this.state.showProfilePicUpload){
			this.setState({
				showProfilePicUpload: true
			})
		}else{
			this.setState({
				showProfilePicUpload: false
			})
		}
	}
	setNewBio(newBio){
		this.setState({
			bio: newBio
		})
	}
	logout(){
		axios.get('/logout').then(function(){
			location.replace('/');
		})
	}
	render(){
        const children = React.cloneElement(this.props.children, {
            userImg: this.state.userImg,
            first: this.state.first,
            last: this.state.last,
            bio: this.state.bio,
            setNewBio: newBio => this.setNewBio(newBio)
        });
        var newMessages = this.props.counter
		return (
			<div className="app">
				<div className="header">
						<div className="header-img-cont">
							<Link to="/"><img className="header-img" src="/static/images/logo.jpg" /></Link>
							<div className="header-logout">
								<img className="header-img" src={this.state.userImg} alt={this.state.first, this.state.last} onClick={this.showProfilePicUpload} />
								<p onClick={this.logout}>Logout</p>
							</div>
						</div>
					{this.state.showProfilePicUpload && <ProfilePicUpload setImage={img => this.setState({userImg: img})} exit={this.showProfilePicUpload} />}
				</div>
				<div className="body">
					<div className="left-menu">
						<Link className="link" to="/online">Online Users</Link>
						<Link className="link" to="/chat">Global Chat {newMessages !== 0 && newMessages}</Link>
						<Link className="link" to="/messages">Messages</Link>
						<Link className="link" to="/friends">Friends</Link>
					</div>
					{children}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state){
	return {
		messages: state.chat,
		counter: state.counter
	}
}

export default connect(mapStateToProps)(App)

