import * as io from 'socket.io-client'
import axios from 'axios'
import { store } from './start'
import { receiveOnlineUsers, addMessage, storeCounterToNull, receivePrivateChats, getPrivateMessages } from './actions'

let socket;
var counter = 0;
export default function getSocket(){
	if(!socket){
		socket = io.connect();
		socket.on('connect', function(){
			axios.get(`/connected/${socket.id}`);
		});
		socket.on('disconnect', function(){
			axios.get(`/disconnected/${socket.id}`)
		})
		socket.on('onLineUsers', function(onlineUsers){
			store.dispatch(receiveOnlineUsers(onlineUsers));
		})
		socket.on('messages', function(messages){
			counter++;
			store.dispatch(addMessage(messages, counter));
		})
		socket.on('myPrivateChats', function(privateChats){
			store.dispatch(receivePrivateChats(privateChats));
		})
		socket.on('newPrivateMess', function(privateMessages){
			store.dispatch(getPrivateMessages(privateMessages))
		})
	}
	return socket;
}

export function countToNull(){
	counter = 0;
	store.dispatch(storeCounterToNull())

}

