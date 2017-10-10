const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = express.Router();
const bodyParser = require('body-parser');
const secrets = require('./secrets.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(secrets.db);
const csrf = require('csurf');
const csrfProtection = csrf();
const compression = require('compression');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Store = require('connect-redis')(session);
const multer = require('multer');
const uidSafe = require('uid-safe');
const knox = require('knox');
const path = require('path');
const fs = require('fs');

app.use(session({
    store: new Store({
        ttl: 3600,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: secrets.secret
}));

app.use(bodyParser.json());


// app.use(cookieSession({
//     secret: secrets.secret,
//     maxAge: 1000 * 60 * 60 * 24 * 90
// }))

// app.use(csurf());

// app.use(function(req, res, next){
//     res.cookie('t', req.csrfToken());
//     next();
// })

app.use(compression());
app.use("/static", express.static(__dirname + '/public'))

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'spicedling'
});

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

var onlineUsers = [];

io.on('connection', function(socket) {
    socket.on('disconnect', function() {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        getUsersByIdDb(onlineUsers.map(user => user.userId)).then(function(users){
			io.sockets.emit('onLineUsers', users)
		}).catch(function(err){
			console.log('CONNECTED/SOCKETID', err.stack)
		})
    });
});

app.get('/connected/:socketId', function(req, res){
	if(req.session.user){
		const userId = req.session.user.id;
		const socketId = req.params.socketId;
		const userIsOnline = onlineUsers.find(user => user.userId == userId);
		const socketIsOnline = onlineUsers.find(user => user.socketId == socketId);
		if(!socketIsOnline && io.sockets.sockets[socketId]){
			onlineUsers.push({
				socketId, userId
			})
			getUsersByIdDb(onlineUsers.map(user => user.userId)).then(function(users){
				io.sockets.emit('onLineUsers', users)
			}).catch(function(err){
				console.log('CONNECTED/SOCKETID', err.stack)
			})
		}
		if(io.sockets.sockets[socketId]){
			getPrivateMessagesFriendsInfoDb(req).then(function(result){
				io.sockets.sockets[socketId].emit('myPrivateChats', result);
			}).catch(function(err){
				console.log('getPrivateMessagesFriendsInfoDb', err.stack)
			})
		}
	}
})

app.get('/newChat', function(req, res){
	getChatInfoDb(req).then(function(result){
		res.json({
			messages: result
		})
	}).catch(function(err){
		console.log(err.stack)
	})
})

app.post('/addMessage', function(req, res){
	setMessageDb(req).then(function(){
		getChatInfoDb(req).then(function(result){
			io.sockets.emit('messages', result);
		})
		res.json({
			success: true
		})
	}).catch(function(err){
		console.log(err.stack)
	})
})

app.get('/messagesWithUser/:id', function(req, res){
	getPrivateMessagesWithUser(req.params.id, req.session.user.id).then(function(result){
		res.json({
			success: true,
			userMessages: result
		})
	}).catch(function(err){
		console.log('getPrivateMessagesWithUser', err.stack);
	})
})

app.post('/addPrivateMessage', function(req, res){
	setPrivateMessagesWithUser(req).then(function(){
		getPrivateMessagesWithUser(req.body.user, req.session.user.id).then(function(result){
			var socketId;
			onlineUsers.forEach(elem => {
				if(elem.userId == req.body.user){
					socketId = elem.socketId
				}
			})
			if(socketId){
				io.sockets.sockets[socketId].emit('newPrivateMess', result);
			}
			res.json({
				success: true,
				userMessages: result
			})
		})
	})
})

app.get('/welcome', function(req, res){
    if(req.session.user){
    	return res.redirect('/');
    }
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
	if(!req.session.user){
    	return res.redirect('/welcome');
    }
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', function(req, res){
    if(req.body.first == '' || req.body.last == '' || req.body.email == '' || req.body.password == ''){
        res.send({
            empty: true
        });
    }else{
        registration(req).then(function(results){
            req.session.user = {
                id: results.id
            }
            res.send({
                success: true
            })
        }).catch(function(err){
            console.log(err.stack);
            res.send({
                success: false
            })
        })
    }
})

app.post('/login', function(req, res){
    if(req.body.email == '' || req.body.password == ''){
        res.send({
            empty: true
        });
    }else{
        login(req).then(function(result){
            if(result){
                res.send({
                    success: true
                })
            }else{
                res.send({
                    success: false
                })
            }
        }).catch(function(err){
        	console.log(err.stack)
        })
    }
})

app.get('/user', function(req, res){
	var id = req.session.user.id;
	if(req.query.id){
		id = Number(req.query.id);
	}
    getUserInfoDB(id).then(function(results){
    	if(results.image !== null){
	        var imageUrl = mkUrl(results.image);
    	}
    	if(results.bio !== null){
    		var bio = results.bio;
    	}
        res.send({
            success: true,
            first: results.first,
            last: results.last,
            image: imageUrl || null,
            bio: bio || null
        });
    }).catch(function(err){
        console.log(err.stack);
        res.send({
            success: false
        })
    })
})

app.post('/upload', uploader.single('file'), setToAWS, function(req, res){
    setUserImageDb(req).then(function(result){
        res.send({
            success: true,
            image: mkUrl(result.image)
        })
    })
})

app.post('/addbio', function(req, res){
	addBioDb(req).then(function(result){
		res.json({
			success: true,
			bio: req.body.bio
		})
	}).catch(function(err){
		console.log('ADDBIO ', err);
	})
})

app.get('/status', function(req, res){
	checkFriendStatusDb(req).then(function(result){
		var senderMe;
		if(result && result.sender == req.session.user.id){
			senderMe = true;
		}else{
			senderMe = false;
		}
		if(!result){
			result = {
				status: null
			}
		}
		res.json({
			success: true,
			sender: senderMe,
			status: result.status
		})
	}).catch(function(err){
		console.log(err.stack);
	})
})

app.post('/addfriend', function(req, res){
	addFriend(req).then(function(result){
		res.json({
			success: true,
			sender: true,
			status: result.status
		})
	}).catch(function(err){
		console.log('ADDFRIEND', err.stack)
	})
})

app.post('/deletefriend', function(req, res){
	deleteFriend(req).then(function(result){
		if(result){
			result.status = null
		}else{
			result.status = false
		}
		res.json({
			success: true,
			status: result.status
		})		
	}).catch(function(err){
		console.log('DELETEFRIEND', err.stack)
	})
})

app.post('/acceptfriend', function(req, res){
	acceptFriend(req).then(function(result){
		res.json({
			success: true,
			status: result.status
		})
	}).catch(function(err){
		console.log('ACCEPTFRIEND', err.stack)
	})
})

app.get('/getfriends', function(req, res){
	getFriendsDb(req).then(function(friends){
		getWaitingsDb(req).then(function(waitings){
			res.json({
				success: true,
				waitings: waitings,
				friends: friends
			});
		})
	})
})

app.get('/logout', function(req, res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		res.redirect('/registration');
	})
})

app.get('*', function(req, res) {
    if(!req.session.user){
        return res.redirect('/welcome');
    }
    res.sendFile(__dirname + '/index.html');  
});

server.listen(8080, function() {
    console.log("I'm listening.")
});


function registration(req){
	return hashPassword(req.body.password).then(function(password){
		var dataArr = [toCapitalLetter(req.body.first), toCapitalLetter(req.body.last), req.body.email, password];
		return registrationDb(dataArr);
	}).catch(function(err){
		console.log(err.stack);
	})
}

function login(req){
    return loginDb(req.body.email).then(function(results){
        return checkPassword(req.body.password, results.password).then(function(doesMatch){
            if(doesMatch){
                req.session.user = {
                    id: results.id
                }
                return true;
            }
        }).catch(function(err){
            console.log(err.stack);
            return false;
        })
    })
}

function loginDb(email){
    return db.query('SELECT id, password FROM users WHERE email = $1', [email]).then(function(results){
        return results.rows[0];
    }).catch(function(err){
		console.log(err.stack);
	})
}

function registrationDb(arr){
    return db.query('INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id', arr).then(function(results){
        return results.rows[0];
    }).catch(function(err){
		console.log(err.stack);
	})
}

function getUserInfoDB(id){
    return db.query(`SELECT id, first, last, image, bio FROM users WHERE id = $1`, [id]).then(function(results){
        return results.rows[0];
    }).catch(function(err){
		console.log(err.stack);
	})
}

function setUserImageDb(req){
    return db.query('UPDATE users SET image = $2 WHERE id = $1 RETURNING image', [req.session.user.id, req.file.filename]).then(function(result){
    	return result.rows[0];
    })
}

function addBioDb(req){
	return db.query(`UPDATE users SET bio = $1 WHERE id = $2`, [req.body.bio, req.session.user.id]).then(function(result){
		return req.body.bio;
	}).catch(function(err){
		console.log(err.stack);
	})
}

function checkFriendStatusDb(req){
	var arr = [req.session.user.id, req.query.id];
	return db.query('SELECT sender, status FROM friends WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1)', arr).then(function(results){
		return results.rows[0];
	}).catch(function(err){
		console.log(err.stack);
	})
}

function addFriend(req){
	var arr = [req.session.user.id, req.body.recipient, req.body.status];
	return db.query('INSERT INTO friends (sender, recipient, status) VALUES ($1, $2, $3) RETURNING status', arr).then(function(result){
		return result.rows[0];
	}).catch(function(err){
		console.log(err.stack);
	})
}

function deleteFriend(req){
	var arr = [req.session.user.id, req.body.recipient];
	return db.query('DELETE FROM friends WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1)', arr).then(function(result){
		return true;
	}).catch(function(err){
		console.log(err.stack);
		return false;
	})
}

function acceptFriend(req){
	var arr = [req.session.user.id, req.body.recipient, req.body.status];
	return db.query('UPDATE friends SET status = $3 WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1) RETURNING status', arr).then(function(result){
		return result.rows[0];
	}).catch(function(err){
		console.log(err.stack);
	})
}

function getFriendsDb(req){
	return db.query(`SELECT users.id, users.first, users.last, users.image
					 FROM users
					 JOIN friends
					 ON (status = 1 AND recipient = $1 AND sender = users.id)
					 OR (status = 1 AND sender = $1 AND recipient = users.id)`, [req.session.user.id]).then(function(results){
		results.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
		return results.rows;
	}).catch(function(err){
		console.log('GETFRIENDS', err.stack)
	})
}

function getWaitingsDb(req){
	return db.query(`SELECT users.id, users.first, users.last, users.image
					 FROM users
					 INNER JOIN friends
					 ON friends.sender = users.id AND status = 2 AND recipient = $1`, [req.session.user.id]).then(function(results){
		results.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
		return results.rows;
	}).catch(function(err){
		console.log('GETWAITINGS', err.stack)
	})
}

function getUsersByIdDb(ids){
	return db.query('SELECT first, last, image, id FROM users WHERE id = ANY($1)', [ids]).then(function(result){
		result.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
		})
		return result.rows;
	}).catch(function(err){
		console.log('GETUSERBYIDDB', err.stack)
	})
}

function getChatInfoDb(req){
	return db.query(`SELECT users.id, users.first, users.last, users.image, chat.message
					 FROM users
					 INNER JOIN chat
					 ON chat.user_id = users.id ORDER BY chat.id DESC LIMIT 20`).then(function(results){
					 	var arr = [];
					 	results.rows.map(function(obj){
							obj.image = mkUrl(obj.image)
							arr.unshift(obj);
						})
					 	return arr;
					 })
}

function setMessageDb(req){
	return db.query('INSERT INTO chat (user_id, message) VALUES ($1, $2)', [req.session.user.id, req.body.message]);
}

function getPrivateMessagesFriendsInfoDb(req){
	return db.query(`SELECT users.id, users.first, users.last, users.image, messages.message
					 FROM messages 
					 JOIN users 
					 ON (messages.first_user_id = $1 AND users.id = messages.second_user_id) 
					 OR (messages.second_user_id = $1 AND users.id = messages.first_user_id)
					 ORDER BY message_created_at DESC`, [req.session.user.id]).then(function(result){
		var array = result.rows;
		var newArray = [];
		for(var i = 0; i < array.length; i++){
			if(!newArray.find(elem => elem.id == array[i].id)){
				array[i].image = mkUrl(array[i].image);
				newArray.push(array[i]);
			}
		}
		return newArray;
	})
}

function getPrivateMessagesWithUser(first, second){
	return db.query(`SELECT users.id, users.first, users.last, users.image, messages.message, messages.first_user_id, messages.second_user_id
					 FROM messages 
					 JOIN users 
					 ON (messages.first_user_id = $1 AND messages.second_user_id = $2 AND users.id = messages.first_user_id) 
					 OR (messages.second_user_id = $1 AND messages.first_user_id = $2 AND users.id = messages.first_user_id)
					 ORDER BY message_created_at DESC`, [first, second]).then(function(result){
	 	var arr = [];
	 	result.rows.map(function(obj){
			obj.image = mkUrl(obj.image)
			arr.unshift(obj);
		})
		return arr;
	})
}

function setPrivateMessagesWithUser(req){
	return db.query('INSERT INTO messages (first_user_id, second_user_id, message) VALUES ($1, $2, $3)', [req.session.user.id, req.body.user, req.body.message]);
}

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}

function toCapitalLetter(str){
	return str.charAt(0).toUpperCase() + str.substr(1);
}

function mkUrl(data){
	if(data){
	    return data = secrets.s3Url + data;
	}else{
		return null;
	}
}

function setToAWS(req, res, next){
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if(wasSuccessful){
            next();
        }
    });
}









