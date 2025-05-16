from flask import Flask
from pymongo import MongoClient

# Replace with your MongoDB connection string
MONGO_URI = "mongodb+srv://sakshi:gaurinde@cluster0.vpbqv.mongodb.net/sp_db?retryWrites=true&w=majority&appName=Cluster0"

app = Flask(__name__)
client = MongoClient(MONGO_URI)
db = client.get_database() # Replace with your desired database name if different from the URI

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/test_db')
def test_database_connection():
    try:
        # The ping command is cheap and does not require auth.
        client.admin.command('ping')
        return "Successfully connected to MongoDB Atlas!"
    except Exception as e:
        return f"Could not connect to MongoDB Atlas: {e}"

if __name__ == '__main__':
    app.run(debug=True)