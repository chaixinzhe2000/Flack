import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, send
from flask_socketio import join_room, leave_room
import sys


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels,messages = {}, {}


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
	message_array = []
	message_array.append(message)
	channels[channel] = message_array
	emit("incoming-message", {'user': user,
							  'time': time, 'message': message}, room=channel)


@socketio.on("create-channel")
def create_channel(data):
	name = data['channel-name']
	if name in channels:
		name = 'rejected'
	else:
		channels[name] = True
	submitter = data['submitter']
	emit("incoming-channel-name", {'name': name,
								   'submitter': submitter}, broadcast=True)


@socketio.on('join')
def on_join(data):
	username = data['username']
	room = data['room']
	join_room(room)
	message = str(username) + ' has entered the room.'
	emit("incoming-user", {'message': message, 'username': username}, room=room)


@socketio.on('leave')
def on_leave(data):
	username = data['username']
	room = data['room']
	leave_room(room)
	message = str(username) + ' has left the room.'
	emit("outgoing-user", {'message': message}, room=room)

@socketio.on('retrieve-history')
def retrieve(data):
	room = data['room']
	prev_msg = channels[room]
	emit("chat-history", {'prev-message': prev_msg}, room=room)