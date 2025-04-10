from flask_socketio import SocketIO

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")