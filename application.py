import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
	return render_template("index.html")


@socketio.on("submit-message")
def send_msg(data):
	user = data['user']
	time = data['time']
	message = data['message']
	print(user)
	emit("incoming-message", {'user': user, 'time': time, 'message': message}, broadcast=True)
