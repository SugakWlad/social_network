import React from 'react';
import { AddBio } from './AddBio'

export class Profile extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			showBio: false
		}
		this.showBio = this.showBio.bind(this);
	}
	showBio(){
		if(!this.state.showBio){
			this.setState({
				showBio: true
			})
		}else{
			this.setState({
				showBio: false
			})
		}
	}
	render(){
		return (
			<div className="user-cont">
				<div className="user-img-cont">
					<img className="user-img" src={this.props.userImg} />
				</div>
				<div className="user-info">
					<h2>{this.props.first} {this.props.last}</h2>
					{this.props.bio && <p onClick={this.showBio}>{this.props.bio}</p>}
					{!this.props.bio && <p onClick={this.showBio}>Add your bio</p>}
					{this.state.showBio && <AddBio setNewBio={newBio => this.props.setNewBio(newBio)} showBio={this.showBio} />}
				</div>
			</div>
		);
	}
}