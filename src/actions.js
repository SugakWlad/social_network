import axios from 'axios';

export function receiveFriends(){
    return axios.get('/getfriends').then(resp => {
    	return {
            type: 'RECEIVE_FRIENDS',
            waitings: resp.data.waitings,
            friends: resp.data.friends
        }
    });
}

export function receiveOnlineUsers(users){
	return {
		type: 'RECEIVE_ONLINE_USERS',
		onlineUsers: users
	}
}

export function addMessage(messages, counter){
    return {
        type: 'RECEIVE_MESSAGES',
        messages: messages,
        counter: counter
    }
}

export function storeCounterToNull(){
    return{
        type: 'COUNTER_TO_NULL',
        counter: 0
    }
}

export function receivePrivateChats(privateChats){
    return {
        type: 'RECEIVE_PRIVATE_CHATS',
        privateChats: privateChats
    }
}

export function getPrivateMessages(messagesWithUser){
    return {
        type: 'RECEIVE_PRIVATE_MESSAGES',
        privatMessages: messagesWithUser
    }
}









