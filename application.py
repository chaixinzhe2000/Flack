import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
import sys


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels, messages = {}, {}
channels['Public'] = 'Public'
messages['Public'] = []


@app.route("/")
def index():
	print("hello")
	return render_template("index.html")


@socketio.on("submit-message")
def send_msg(data):
	user = data['user']
	time = data['time']
	message = data['message']
	channel = data['channel']
	if channel not in messages:
		message_array = [user, time, message]
		messages[channel] = []
		messages[channel].append(message_array)
	else:
		message_array = messages[channel]
		if len(message_array) > 100:
			message_array.pop(0)
		new_message = [user, time, message]
		messages[channel].append(new_message)
	emit("incoming-message", {'user': user,
							  'time': time, 'message': message}, room=channel)


@socketio.on("create-channel")
def create_channel(data):
	name = data['channel-name']
	if name in channels:
		name = 'rejected'
	else:
		channels[name] = name
		messages[name] = []
	submitter = data['submitter']
	emit("incoming-channel-name", {'name': name,
								   'submitter': submitter}, broadcast=True)


@socketio.on('join')
def on_join(data):
	username = data['username']
	room = data['room']
	join_room(room)
	message = str(username) + ' has entered the room.'
	emit("incoming-user", {'message': message,
						   'username': username}, room=room)


@socketio.on('leave')
def on_leave(data):
	username = data['username']
	room = data['room']
	leave_room(room)
	message = str(username) + ' has left the room.'
	emit("outgoing-user", {'message': message}, room=room)


@socketio.on('retrieve-channel')
def retrieve_channel(data):
	username = data['username']
	emit("channel-history", {'prev_channel': list(channels.keys()), 'username': username}, broadcast=True)


@socketio.on('retrieve-history')
def retrieve(data):
	room = data['room']
	if messages[room] is None or len(messages[room]) == 0:
		prev_msg = []
	else:
		prev_msg = messages[room]
	emit("chat-history", {'prev_message': prev_msg}, room=room)
