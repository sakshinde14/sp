# backend/server.py (or relevant routes file)

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId # Import ObjectId for querying by ID
import os # For file operations like deletion
from werkzeug.utils import secure_filename # For securing filenames
from datetime import datetime
# You might need to import your existing models/schema definitions if you have them in separate files
# For simplicity, I'll assume direct PyMongo usage here.

# --- MongoDB Setup (Assuming you have this already) ---
client = MongoClient('mongodb://localhost:27017/') # Or your MongoDB Atlas connection string
db = client.study_portal_db # Your database name

# Access collections
users_collection = db.users
admin_users_collection = db.admin_users
study_materials_collection = db.study_materials # Your collection for study materials

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Multer Configuration (assuming you set up a simple local upload folder) ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- EXISTING AUTHENTICATION ROUTES (example, you'll have more robust logic) ---
@app.route('/api/student/login', methods=['POST'])
def student_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = users_collection.find_one({"username": username, "password": password}) # In real app, hash password
    if user:
        return jsonify({"message": "Student login successful", "userRole": "student"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Add other existing routes like student signup, admin login, logout...

# --- NEW: Fetch Materials for a Specific Subject ---
@app.route('/api/materials/by_subject', methods=['GET'])
def get_materials_by_subject():
    course_code = request.args.get('courseCode')
    year = request.args.get('year')
    semester = request.args.get('semester')
    subject = request.args.get('subject')

    if not all([course_code, year, semester, subject]):
        return jsonify({"message": "Missing required parameters (courseCode, year, semester, subject)"}), 400

    try:
        # Convert year and semester to integers for database query
        year = int(year)
        semester = int(semester)
    except ValueError:
        return jsonify({"message": "Year and semester must be valid numbers"}), 400

    query = {
        "courseCode": course_code,
        "year": year,
        "semester": semester,
        "subject": subject
    }

    materials = []
    for material_doc in study_materials_collection.find(query):
        # Convert ObjectId to string for JSON serialization
        material_doc['_id'] = str(material_doc['_id'])
        materials.append(material_doc)

    return jsonify(materials), 200

# --- UPDATED: Admin Add Material Route (to include materialType and contentUrl) ---
@app.route('/api/admin/materials/add', methods=['POST'])
def admin_add_material():
    title = request.form.get('title')
    description = request.form.get('description')
    course_code = request.form.get('courseCode')
    year = request.form.get('year')
    semester = request.form.get('semester')
    subject = request.form.get('subject')
    material_type = request.form.get('materialType') # New
    content_url = request.form.get('contentUrl') # New

    if not all([title, course_code, year, semester, subject, material_type]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        year = int(year)
        semester = int(semester)
    except ValueError:
        return jsonify({"message": "Year and semester must be valid numbers"}), 400

    file_path = None
    file_original_name = None

    if 'materialFile' in request.files: # Check if a file was uploaded
        file = request.files['materialFile']
        if file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            file_original_name = file.filename # Store original name
            file_path = f"/uploads/{filename}" # Store web-accessible path

    new_material_data = {
        "title": title,
        "description": description,
        "courseCode": course_code,
        "year": year,
        "semester": semester,
        "subject": subject,
        "materialType": material_type,
        "filePath": file_path,
        "fileOriginalName": file_original_name,
        "contentUrl": content_url, # Store the content URL
        "uploadedAt": datetime.utcnow() # Assuming you import datetime
    }

    try:
        result = study_materials_collection.insert_one(new_material_data)
        new_material_data['_id'] = str(result.inserted_id) # Convert ObjectId to string
        return jsonify({"message": "Material added successfully", "material": new_material_data}), 201
    except Exception as e:
        return jsonify({"message": "Error adding material", "error": str(e)}), 500

# --- Add other admin routes like GET all materials, UPDATE, DELETE (ensure they use study_materials_collection) ---
# Example for GET all materials:
@app.route('/api/admin/materials', methods=['GET'])
def admin_get_all_materials():
    materials = []
    for material_doc in study_materials_collection.find({}):
        material_doc['_id'] = str(material_doc['_id'])
        materials.append(material_doc)
    return jsonify(materials), 200

# Example for DELETE material:
@app.route('/api/admin/materials/<id>', methods=['DELETE'])
def admin_delete_material(id):
    try:
        # Before deleting from DB, check if there's a file to remove
        material_doc = study_materials_collection.find_one({"_id": ObjectId(id)})
        if material_doc and material_doc.get('filePath') and material_doc.get('filePath').startswith('/uploads/'):
            file_name = material_doc['filePath'].replace('/uploads/', '')
            file_path_on_disk = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
            if os.path.exists(file_path_on_disk):
                os.remove(file_path_on_disk)
                print(f"Deleted file: {file_path_on_disk}")

        result = study_materials_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 1:
            return jsonify({"message": "Material deleted successfully"}), 200
        return jsonify({"message": "Material not found"}), 404
    except Exception as e:
        return jsonify({"message": "Error deleting material", "error": str(e)}), 500

# Start the server (at the bottom of your server.py)
if __name__ == '__main__':
    app.run(debug=True, port=5000)