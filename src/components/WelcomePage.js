import React from 'react';
import { Link } from 'react-router';
import axios from 'axios';

export class Welcome extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		return (
			<div id="not_login-cont">
				<div>
					<h1>Be with us on</h1>
					<img className="welcome-img" src="/static/images/logo.jpg" />
				</div>
				{this.props.children}
			</div>
		)
	}
}

class AuthForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			first: '',
			last: '',
			email: '',
			password: ''
		};
		this.input = this.input.bind(this);
	}
	input(e){
		this.setState({
			[e.target.name]: e.target.value
		})
	}
	submit(){
		axios.post(this.props.url, {
			first: this.state.first,
			last: this.state.last,
			email: this.state.email,
			password: this.state.password
		}).then(resp => {
			if(!resp.data.success){
				return this.setState({
					error: true
				})
			}else if(resp.data.empty){
				this.setState({
					empty: true
				})
			}else{
				location.replace('/');
			}
		})
	}
	render(){
		const Component = this.props.component;
		return <Component empty={this.state.empty} input={e => this.input(e)} submit={e => this.submit()} />;
	}
}

function RegistrationForm({ input, submit, empty, error }){
	return (
    	<div className="log-reg-form">
    		<h3>Join us now!</h3>
    		{error && <div className="error">Something is wrong, try again.</div>}
    		{empty && <div className="empty">Please fill all field in.</div>}
        	<input name="first" placeholder="First Name" onChange={input} />
        	<input name="last" placeholder="Last Name" onChange={input} />
        	<input name="email" placeholder="Email" onChange={input} />
        	<input name="password" placeholder="Password" type="password" onChange={input} />
        	<button onClick={e => submit()}>Submit</button>
        	<p>Already a member? <Link to="/login">Log in</Link></p>
        </div>						
    );
}

function LoginForm({ input, submit, empty, error }){
	return (
    	<div className="log-reg-form">
    		<h3>Log in</h3>
    		{error && <div className="error">Something is wrong, try again.</div>}
    		{empty && <div className="empty">Please fill all field in.</div>}
        	<input name="email" placeholder="Email" onChange={input} />
        	<input name="password" placeholder="Password" type="password" onChange={input} />
        	<button onClick={e => submit()}>Log in</button>
        </div>						
    );
}

export function Registration() {
    return <AuthForm component={RegistrationForm} url="/register" />;
}

export function Login() {
    return <AuthForm component={LoginForm} url="/login" />;
}