from flask import Flask, request, jsonify, session
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
app.config['SECRET_KEY'] = 'a_very_long_and_random_secret_key_here_that_is_unique_and_not_guessable' # <--- IMPORTANT!

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

    admin = db[ADMIN_COLLECTION].find_one({'username': username})

    if admin:
        stored_password_hash = admin.get('password') # Renamed for clarity, it's the hash

        # Ensure the stored hash is actually bytes and then check
        if stored_password_hash and isinstance(stored_password_hash, bytes) and \
           checkpw(password.encode('utf-8'), stored_password_hash):
            session['user_id'] = username # Store admin username in session
            session['role'] = 'admin'     # Store role in session
            return jsonify({'message': 'Admin login successful', 'role': 'admin'}), 200
        else:
            # This covers cases where password doesn't match,
            # or stored_password_hash is not bytes, or is None.
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = list(db[COURSE_COLLECTION].find({}, {'_id': 0}))  # Fetch all courses, exclude _id
    return jsonify(courses), 200

@app.route('/api/courses/<course_code>/years', methods=['GET'])
def get_years(course_code):
    course = db[COURSE_COLLECTION].find_one({'code': course_code}, {'_id': 0, 'years': 1})  # Fetch the course, get only 'years'
    if course:
        years = [y['year'] for y in course.get('years', [])]  # Extract the 'year' values
        return jsonify(years), 200
    else:
        return jsonify([]), 404  # Return 404 if course not found


@app.route('/api/courses/<course_code>/years/<int:year>/semesters', methods=['GET'])
def get_semesters(course_code, year):
    course = db[COURSE_COLLECTION].find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        year_data = next((y for y in course.get('years', []) if y['year'] == year), None)
        if year_data:
            semesters = [s['semester'] for s in year_data.get('semesters', [])]
            return jsonify(semesters), 200
        else:
            return jsonify([]), 404
    else:
        return jsonify([]), 404


@app.route('/api/courses/<course_code>/years/<int:year>/semesters/<int:semester>/subjects', methods=['GET'])
def get_subjects(course_code, year, semester):
    course = db[COURSE_COLLECTION].find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        year_data = next((y for y in course.get('years', []) if y['year'] == year), None)
        if year_data:
            semester_data = next((s for s in year_data.get('semesters', []) if s['semester'] == semester), None)
            if semester_data:
                subjects = semester_data.get('subjects', [])
                return jsonify(subjects), 200
            else:
                return jsonify([]), 404
        else:
            return jsonify([]), 404
    else:
        return jsonify([]), 404



@app.route('/api/search/subjects', methods=['GET'])
def search_subjects():
    search_term = request.args.get('q', '').strip() # Get the 'q' query parameter
    if not search_term:
        return jsonify([]), 200 # Return empty list if no search term

    # Use MongoDB's aggregation pipeline for efficient search
    # This allows us to unwind nested arrays and search within them
    pipeline = [
        # Find courses where any subject MIGHT match (optional optimization if you have huge data)
        # For now, let's just go straight to unwinding
        {"$unwind": "$years"},
        {"$unwind": "$years.semesters"},
        {"$unwind": "$years.semesters.subjects"},
        {"$match": {
            "years.semesters.subjects": {"$regex": search_term, "$options": "i"} # Case-insensitive partial match
        }},
        {"$project": {
            "_id": 0,
            "subjectName": "$years.semesters.subjects",
            "courseName": "$title", # 'title' is the full course name
            "courseCode": "$code",  # We'll need the code for routing
            "year": "$years.year",
            "semester": "$years.semesters.semester"
        }}
    ]

    results = list(db[COURSE_COLLECTION].aggregate(pipeline))
    return jsonify(results), 200

@app.route('/api/logout', methods=['POST'])
def logout_user():
    session.clear() # Clears all data from the session
    return jsonify({"message": "Successfully logged out"}), 200



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')  # Make it accessible from your frontend