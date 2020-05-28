document.addEventListener('DOMContentLoaded', () => {
	if (!localStorage.getItem('username')) {
		$(window).on('load', function () {
			$('#myModal').modal('show');
		});
		document.querySelector('#username-form').onsubmit = () => {
			var nameValue = document.getElementById("username-data").value;
			localStorage.setItem('username', nameValue);
			var cappedName = localStorage.getItem('username').toUpperCase();
			document.querySelector('#greetings').innerHTML = `Welcome to the chat, ${cappedName}`;
		}
	} else {
		var cappedName = localStorage.getItem('username').toUpperCase();
		document.querySelector('#greetings').innerHTML = `Welcome to the chat, ${cappedName}`;
		document.querySelector('#send').disabled = true;
		document.querySelector('#messages').onkeyup = () => {
			if (document.querySelector('#messages').value.length > 0)
				document.querySelector('#send').disabled = false;
			else
				document.querySelector('#send').disabled = true;
		};
		const username = localStorage.getItem('username')
		document.querySelector('#send').onclick = () => {
			var msgBubble = document.createElement('div');
			msgBubble.className = "message-bubble"
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
			minute= checkTime(minute);
			var msgTime = d.concat(" ", m, " ", h, ":", minute);
			// outputing values
			msgBubble.innerHTML = `
			<div class="msg-text">
			<span class="msg-username"> ${username} </span>
			<span class="msg-time"> ${msgTime} </span> </br>
			<span class="msg-value"> ${messageValue}</span> </div>`
			document.querySelector('#sent-messages').append(msgBubble);
			document.querySelector('#messages').value = '';
			document.querySelector('#send').disabled = true;
			return false;
		};


	}
})

