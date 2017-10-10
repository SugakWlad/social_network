import React from 'react';
import axios from 'axios';

export class AddBio extends React.Component{
	constructor(props) {
		super(props);
		this.addBio = this.addBio.bind(this);
		this.sendBio = this.sendBio.bind(this);

	}
	addBio(e){
		this.setState({
			newBio: e.target.value
		})
	}
	sendBio(){
		axios.post('/addbio', {
			bio: this.state.newBio
		}).then(resp => {
			this.props.setNewBio(resp.data.bio)
			this.props.showBio()
		})
	}
	render(){
		return (
			<div>
				<input name="bio" placeholder="Add your bio" onChange={e => this.addBio(e)} />
				<button onClick={this.sendBio}>Add bio</button>
			</div>
		)
	}
}