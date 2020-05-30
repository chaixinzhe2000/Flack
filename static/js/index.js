document.addEventListener('DOMContentLoaded', () => {
	if (!localStorage.getItem('username')) {
		$(window).on('load', function () {
			$('#myModal').modal('show');
		});
		document.querySelector('#username-form').onsubmit = () => {
			var nameValue = document.getElementById("username-data").value;
			localStorage.setItem('username', nameValue);
			var username = localStorage.getItem('username');
			document.querySelector('#greetings').innerHTML = `Welcome to the chat, ${username}`;
		}
	} else {
		// change the greeting text on the right upper corner
		const username = localStorage.getItem('username')
		document.querySelector('#greetings').innerHTML = `Welcome to the chat, ${username}`;

		// setting up current channel name
		var currChannel = undefined;

		// to control the message button
		document.querySelector('#send').disabled = true;
		document.querySelector('#messages').onkeyup = () => {
			if (document.querySelector('#messages').value.length > 0)
				document.querySelector('#send').disabled = false;
			else
				document.querySelector('#send').disabled = true;
		};

		// to control the channel creation button
		document.querySelector('#create-channel').disabled = true;
		document.querySelector('#channel-name').onkeyup = () => {
			if (document.querySelector('#channel-name').value.length > 0)
				document.querySelector('#create-channel').disabled = false;
			else
				document.querySelector('#create-channel').disabled = true;
		};

		// implementing submission with 'Enter' key
		var input = document.getElementById("messages");
		// Execute a function when the user releases a key on the keyboard
		input.addEventListener("keyup", function (event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				document.getElementById("send").click();
			}
		});

		// connecting to socket.io
		var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

		socket.on('connect', () => {
			// automatically join room 'public'
			socket.emit('join', { 'username': username, 'room': 'public' });
			currChannel = 'public'
			// setting up the channel banner
			document.querySelector('#current-channel-banner').innerHTML = `You are connected to: ${currChannel}`;

			document.querySelector('#create-channel').onclick = () => {
				var channelName = document.querySelector('#channel-name').value;
				socket.emit('create-channel', { 'channel-name': channelName, 'submitter': username });
				// join-leave module
				socket.emit('leave', { 'username': username, 'room': currChannel });
				currChannel = channelName;
				socket.emit('join', { 'username': username, 'room': currChannel });
				document.querySelector('#message-wrapper').innerHTML = ""
				document.querySelector('#current-channel-banner').innerHTML = `You are connected to: ${currChannel}`;
				// routine procedure for button
				document.querySelector('#channel-name').value = '';
				
				document.querySelector('#create-channel').disabled = true;
			}

			document.querySelector('#send').onclick = () => {
				var messageValue = document.querySelector('#messages').value;
				// setting up message time
				const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				var today = new Date();
				var d = today.getDate();
				var m = today.getMonth();
				var h = today.getHours();
				var minute = today.getMinutes();
				function checkTime(i) {
					if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
					return i.toString();
				}
				d = checkTime(d)
				m = month_names_short[m].toUpperCase();
				h = checkTime(h);
				minute = checkTime(minute);
				var msgTime = d.concat(" ", m, " ", h, ":", minute);
				socket.emit('submit-message', { 'user': username, 'time': msgTime, 'message': messageValue, 'channel': currChannel });
				document.querySelector('#messages').value = '';
				document.querySelector('#send').disabled = true;
			}
		})

		// receiving emitted messages
		socket.on('incoming-message', data => {
			var msgBubble = document.createElement('div');
			if (data.user === username) {
				msgBubble.className = "message-bubble-right"
			} else {
				msgBubble.className = "message-bubble-left"
			}
			msgBubble.innerHTML = `
			<div class="msg-text">
			<span class="msg-username"> ${data.user} </span>
			<span class="msg-time"> ${data.time} </span> </br>
			<span class="msg-value"> ${data.message}</span> </div>`
			document.querySelector('#message-wrapper').append(msgBubble);
		})

		// receiving emitted channel names
		socket.on('incoming-channel-name', data => {
			var channel_button = document.createElement('div');
			if (data.name !== 'rejected') {
				channel_button.className = "channel-button"
				channel_button.innerHTML =
					`<button type="button" data-name="${data.name}" class="btn btn-secondary btn-lg btn-block">${data.name}</button>`
				document.querySelector('#channel-list').append(channel_button);
				channel_button.addEventListener('click', () => {
					var channelName = data.name;
					// leave/join module
					socket.emit('leave', { 'username': username, 'room': currChannel });
					currChannel = channelName;
					socket.emit('join', { 'username': username, 'room': currChannel });
					document.querySelector('#message-wrapper').innerHTML = ""
					socket.emit('retrieve-history', { 'room': currChannel });
                    // receiving emitted messages
                    socket.on('chat-history', data => {
						/////////////change it here//////////////
						console.log("retrieve message")
                        var msgBubble = document.createElement('div');
                        if (data.user === username) {
                            msgBubble.className = "message-bubble-right"
                        } else {
                            msgBubble.className = "message-bubble-left"
                        }
                        msgBubble.innerHTML = `
                        <div class="msg-text">
                        <span class="msg-username"> ${data.user} </span>
                        <span class="msg-time"> ${data.time} </span> </br>
                        <span class="msg-value"> ${data.message}</span> </div>`
                        document.querySelector('#message-wrapper').append(msgBubble);
                    })
					document.querySelector('#current-channel-banner').innerHTML = `You are connected to: ${currChannel}`;
				})
			}
		})

		// receiving emitted messages
		socket.on('incoming-user', data => {
			if (!localStorage.getItem(data.username) || localStorage.getItem(data.username) !== data.message) {
				var joinMsg = document.createElement('div');
				joinMsg.innerHTML = `
				<p class="new-user-text">${data.message}</p>`
				document.querySelector('#message-wrapper').append(joinMsg);
				localStorage.setItem(`${data.username}`, `${data.message}`);
			}
		})
	}
})