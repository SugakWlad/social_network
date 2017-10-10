export default function (state = {}, action) {
    if(action.type == 'RECEIVE_FRIENDS'){
        state = Object.assign({}, state, {
            waitings: action.waitings,
            friends: action.friends
        });
    }
    if(action.type == 'RECEIVE_ONLINE_USERS'){
    	state = Object.assign({}, state, {
    		onlineUsers: action.onlineUsers
    	});
    }
    if(action.type == 'RECEIVE_MESSAGES'){
        state = Object.assign({}, state, {
            chat: action.messages,
            counter: action.counter
        })
    }
    if(action.type == 'COUNTER_TO_NULL'){
        state = Object.assign({}, state, {
            counter: action.counter
        })
    }
    if(action.type == 'RECEIVE_PRIVATE_CHATS'){
        state = Object.assign({}, state, {
            privateChats: action.privateChats
        })
    }
    if(action.type == 'RECEIVE_PRIVATE_MESSAGES'){
        state = Object.assign({}, state, {
            privatMessages: action.privatMessages
        })
    }
    return state;
}




