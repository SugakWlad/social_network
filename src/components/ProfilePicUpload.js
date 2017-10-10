import React from 'react';
import axios from 'axios';

export class ProfilePicUpload extends React.Component{
	constructor(props) {
		super(props);
		this.upload = this.upload.bind(this);
	}
	upload(e){
		var formData = new FormData;
		formData.append("file", document.querySelector('input[type="file"]').files[0]);
		axios.post('/upload', formData).then(resp => {
			this.props.setImage(resp.data.image);
			this.props.exit();
		})
	}
	render(){
		return (
			<div>
				<div className="shadow" onClick={this.props.exit}></div>
				<div className="picture_uploader">
					<h3>Want to change your image?</h3>
					<input type="file" id="uploadFile" onChange={e => this.upload(e)}/>
					<label htmlFor="uploadFile">UPLOAD</label>
				</div>
			</div>
		)
	}
}