import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise';
import { connect, Provider } from 'react-redux';
import reducer from './reducers';

import getSocket from './socket';

import App from './components/App';
import Friends from './components/Friends';
import OnlineUsers from './components/OnlineUsers';
import OtherProfile from './components/OtherProfile';
import PrivateMessages from './components/PrivateMessages'
import { Profile } from './components/Profile';
import { Welcome, Registration, Login } from './components/WelcomePage';
import Chat from './components/Chat';


export const store = createStore(reducer, applyMiddleware(reduxPromise));

getSocket();

const logOutRouter = (
    <Router history={hashHistory}>
        <Route path="/" component={Welcome}>
            <Route path="/login" component={Login} />
            <IndexRoute component={Registration} />
  		</Route>
    </Router>
);

const logInRouter = (
	<Provider store = {store}>
	    <Router history={browserHistory}>
	        <Route path="/" component={App}>
			    <IndexRoute component={Profile}/>
			    <Route path="online" component={OnlineUsers} />
			    <Route path="user/:id" component={OtherProfile} />
			    <Route path="friends" component={Friends} />
			    <Route path="chat" component={Chat} />
			    <Route path="messages" component={PrivateMessages} />
			    <Route path="messages/:id" component={PrivateMessages} />
	  		</Route>
	    </Router>
	</Provider>
);

var router;
if(location.pathname == '/welcome'){
	router = logOutRouter;
}else{
	router = logInRouter;
}
ReactDOM.render(
    router,
    document.querySelector('main')
);



