from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from bcrypt import hashpw, checkpw, gensalt
import os # For generating a strong secret key

# Replace with your actual MongoDB connection string
MONGO_URI = "mongodb+srv://sakshi:gaurinde@cluster0.vpbqv.mongodb.net/sp_db?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "sp_db"
STUDENT_COLLECTION = "students"
ADMIN_COLLECTION = "admins"
COURSE_COLLECTION = "courses"

app = Flask(__name__)

# IMPORTANT: Set a strong, random secret key for session management!
# In production, use os.environ.get('SECRET_KEY') or a similar method
app.config['SECRET_KEY'] = os.urandom(24).hex() # Generates a random 48-char hex string
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # Set to True in production with HTTPS

# Enable CORS for your React app's origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

client = MongoClient(MONGO_URI)
db = client.get_database(DB_NAME)

# --- Helper function to seed an admin user (FOR DEVELOPMENT/TESTING ONLY) ---
def seed_admin_user():
    admin_username = "superadmin"
    admin_password = "supersecurepassword" # Use a strong password here
    
    # Check if admin already exists
    if db[ADMIN_COLLECTION].find_one({'username': admin_username}):
        print(f"Admin '{admin_username}' already exists. Skipping seeding.")
        return

    # Hash the password for the admin
    salt = gensalt()
    hashed_password = hashpw(admin_password.encode('utf-8'), salt) # bcrypt hashes are bytes

    admin_data = {
        'username': admin_username,
        'password': hashed_password, # Store as bytes directly
        'salt': salt.decode('utf-8') # Store salt as string if needed, or don't store it if checkpw handles it
    }
    db[ADMIN_COLLECTION].insert_one(admin_data)
    print(f"Admin '{admin_username}' seeded successfully!")

# Call the seed function when the app starts (useful for dev)
with app.app_context(): # Ensure app context for db operations
    seed_admin_user()


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

# --- Student Signup Route ---
@app.route('/api/auth/signup/student', methods=['POST'])
def signup_student():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not full_name or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if db[STUDENT_COLLECTION].find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 409

    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    student_data = {'fullName': full_name, 'email': email, 'password': hashed_password, 'salt': salt.decode('utf-8')}
    db[STUDENT_COLLECTION].insert_one(student_data)

    return jsonify({'message': 'Student registered successfully'}), 201

# --- Admin Signup Route (Placeholder - implement if you need a signup form for admins) ---
@app.route('/api/auth/signup/admin', methods=['POST'])
def signup_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if db[ADMIN_COLLECTION].find_one({'username': username}):
        return jsonify({'message': 'Username already exists'}), 409

    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)

    admin_data = {'username': username, 'password': hashed_password, 'salt': salt.decode('utf-8')}
    db[ADMIN_COLLECTION].insert_one(admin_data)

    return jsonify({'message': 'Admin registered successfully'}), 201

# --- Student Login Route ---
@app.route('/api/auth/login/student', methods=['POST'])
def login_student():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    student = db[STUDENT_COLLECTION].find_one({'email': email})

    if student:
        stored_password_hash = student.get('password')
        # Check if stored_password_hash is bytes and if password matches
        if stored_password_hash and isinstance(stored_password_hash, bytes) and \
           checkpw(password.encode('utf-8'), stored_password_hash):
            session['user_id'] = str(student['_id']) # Use ObjectId as string for session
            session['role'] = 'student'
            return jsonify({'message': 'Student login successful', 'role': 'student'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# --- Admin Login Route (Corrected) ---
@app.route('/api/auth/login/admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    admin = db[ADMIN_COLLECTION].find_one({'username': username})

    if admin:
        stored_password_hash = admin.get('password')

        if stored_password_hash and isinstance(stored_password_hash, bytes) and \
           checkpw(password.encode('utf-8'), stored_password_hash):
            session['user_id'] = str(admin['_id']) # Store admin ID in session
            session['role'] = 'admin'     # Store role in session
            return jsonify({'message': 'Admin login successful', 'role': 'admin'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# --- Course Data Routes ---
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = list(db[COURSE_COLLECTION].find({}, {'_id': 0}))
    return jsonify(courses), 200

@app.route('/api/courses/<course_code>/years', methods=['GET'])
def get_years(course_code):
    course = db[COURSE_COLLECTION].find_one({'code': course_code}, {'_id': 0, 'years': 1})
    if course:
        years = [y['year'] for y in course.get('years', [])]
        return jsonify(years), 200
    else:
        return jsonify([]), 404

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
def get_subjects_api(course_code, year, semester): # Renamed to avoid conflict with imported get_subjects
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
    search_term = request.args.get('q', '').strip()
    if not search_term:
        return jsonify([]), 200

    pipeline = [
        {"$unwind": "$years"},
        {"$unwind": "$years.semesters"},
        {"$unwind": "$years.semesters.subjects"},
        {"$match": {
            "years.semesters.subjects.title": {"$regex": search_term, "$options": "i"} # Assuming subject 'title' for search
        }},
        {"$project": {
            "_id": 0,
            "subjectName": "$years.semesters.subjects.title", # Extract the subject title
            "courseName": "$title",
            "courseCode": "$code",
            "year": "$years.year",
            "semester": "$years.semesters.semester",
            "materials": "$years.semesters.subjects.materials" # Include materials in search result
        }}
    ]

    results = list(db[COURSE_COLLECTION].aggregate(pipeline))
    return jsonify(results), 200

@app.route('/api/logout', methods=['POST'])
def logout_user():
    session.clear()
    return jsonify({"message": "Successfully logged out"}), 200

# --- Example Protected Route (can be used to check session) ---
@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if 'user_id' in session and 'role' in session:
        return jsonify({"isLoggedIn": True, "userId": session['user_id'], "role": session['role']}), 200
    return jsonify({"isLoggedIn": False}), 401


if __name__ == '__main__':
    # Initialize app context outside app.run for seeding
    with app.app_context():
        # Seed an admin user if they don't exist
        # This will run only once when the app starts if the admin user is not found
        seed_admin_user() 

    app.run(debug=True, host='0.0.0.0', port=5000)