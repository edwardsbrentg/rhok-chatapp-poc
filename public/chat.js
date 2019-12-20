$(function(){

	//buttons and inputs
	var message = $("#message");
	var send_message = $("#send_message");
	var chatroom = $("#chatroom");
	var feedback = $("#feedback");
	var sdk = require('matrix-js-sdk');

	var roomId;

	var client = sdk.createClient("https://matrix.rhok.space");
	var accessToken = null;
	client.login("m.login.password", {"user": "supportseeker", "password": "<credentialsremoved>"}).then((response) => {
		accessToken = response.access_token;
		console.log(accessToken);
	}).then(response => {
		client.startClient();
	});

	client.on('sync',function(state,prevState,res) {
		console.log(state);
		if (state === 'PREPARED') {
			client.createRoom({
				room_alias_name: "privatesupportroom" + (Math.random() * Math.floor(777)).toString(),
				invite: ["@<username goes here>:rhok.space"],
				visibility: 'private',
				name: 'Support Chat'
			}).then((response) => {
				roomId = response.room_id;
				console.log("roomid: " + roomId);
			}).then((response) => {
				client.joinRoom(roomId).then(chatroom.append("You have sucessfully connected, now awaiting a support provider to join the chat"));
			});
		}
	});

	client.on("Room.timeline", function(event, roomz, toStartOfTimeline) {
		console.log(event);
		if (roomz.roomId === roomId) {
			if (event.getType() === "m.room.message") {
				console.log(event.event.content);
				console.log(event.sender.name + ": " + event.event.content.body);
				chatroom.append("<p class='message'<strong>" + event.sender.name + "</strong>: " + event.event.content.body + "</p>");
			} 
			if (event.getType() === "m.room.member") {
				if (event.event.content.membership === "join")
					chatroom.append("<p class='message'<strong>" + event.event.content.displayname + "</strong> has joined the chat</p>");
			}
		}
	})

	//Emit message
	send_message.click(function(){

		if (message.val() !== '') {
			var content = {
				"body": message.val(),
				"msgtype": "m.text"
			};
			
			client.sendEvent(roomId, "m.room.message", content, "", (err, res) => {
				console.log(err);
			});

			message.val('');
		}
	});

	message.keyup(function(event) {
		if (message.val() !== '' && event.keyCode === 13) {
			send_message.click();
		}
	});

	

	//Listen on typing
	client.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});


