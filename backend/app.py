from flask import Flask, request, jsonify
from courses_data import courses_data, get_subjects
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
from flask_cors import CORS  # Import Flask-CORS

# Replace with your actual MongoDB connection string (ensure <password> is replaced)
MONGO_URI = "mongodb+srv://sakshi:gaurinde@cluster0.vpbqv.mongodb.net/sp_db?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "sp_db"  # Your database name
STUDENT_COLLECTION = "students"
ADMIN_COLLECTION = "admins"  # You might have an admin collection
COURSE_COLLECTION = "courses"  # Add this

app = Flask(__name__)
CORS(app)
client = MongoClient(MONGO_URI)
db = client.get_database(DB_NAME)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/test_db')
def test_database_connection():
    try:
        client.admin.command('ping')
        return "Successfully connected to MongoDB Atlas!"
    except Exception as e:
        return f"Could not connect to MongoDB Atlas: {e}"


@app.route('/api/auth/signup/student', methods=['POST'])
def signup_student():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not full_name or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if the email already exists
    if db[STUDENT_COLLECTION].find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 409

    # Hash the password
    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    # Store the new student in the database
    student_data = {'fullName': full_name, 'email': email, 'password': hashed_password, 'salt': salt}
    db[STUDENT_COLLECTION].insert_one(student_data)

    return jsonify({'message': 'Student registered successfully'}), 201


@app.route('/api/auth/login/student', methods=['POST'])
def login_student():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    student = db[STUDENT_COLLECTION].find_one({'email': email})

    if student:
        stored_password = student.get('password')
        stored_salt = student.get('salt')
        if stored_password and checkpw(password.encode('utf-8'), stored_password):
            # Authentication successful
            return jsonify({'message': 'Student login successful'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


# You'll need to implement a similar login route for admin
@app.route('/api/auth/login/admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    admin = db[ADMIN_COLLECTION].find_one({'username': username})  # Assuming you have an 'admins' collection

    if admin:
        stored_password = admin.get('password')
        if stored_password and checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):  # Assuming admin passwords might be stored as plain text for now - SECURE THIS LATER!
            return jsonify({'message': 'Admin login successful'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/courses', methods=['GET'])
def get_courses():
    return jsonify(courses_data), 200

@app.route('/api/courses/<course_code>/years', methods=['GET'])
def get_years(course_code):
    courses = {
        "BSC-CS": [1, 2, 3],
        "BCA": [1, 2, 3],
        "MSC-CS": [1, 2],
        "MSC-CA": [1, 2]
    }
    years = courses.get(course_code, [])  # Get years or an empty list if course not found
    return jsonify(years), 200


@app.route('/api/courses/<course_code>/years/<int:year>/semesters', methods=['GET'])
def get_semesters(course_code, year):
    semesters = [1, 2]  # All courses have semesters 1 and 2 per year
    return jsonify(semesters), 200


@app.route('/api/courses/<course_code>/years/<int:year>/semesters/<int:semester>/subjects', methods=['GET'])
def get_subjects_route(course_code, year, semester):
    subjects = get_subjects(course_code, year, semester)
    return jsonify(subjects), 200



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')  # Make it accessible from your frontend