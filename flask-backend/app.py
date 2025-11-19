# app.py My Flask backend for commute and connect 
# This file runs my backend server and connect to mySQL database
# It provides the CRUD operations for employee data. (Used in Enviroment)

from flask import Flask, request, jsonify  # Flask is for bulidings APIS
from flask_cors import CORS                # CORS lets React talk to Flask
import pymysql   
from werkzeug.security import generate_password_hash, check_password_hash

                          # Connect to MySQL database

# Flask app setup  
app = Flask(__name__)
CORS(app)  # allow all origins (React on local host can acess this API)

# HEALTH CHECK 
# Helath route confirms the backend is running
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

#  MySQL connection settings 
# Telling Python how to connect to my SQL database Version 2 
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Nwoye2025",  # MySQL root password
    "database": "commute_connect_v2",  # my  new database for Iteration 1
    "cursorclass": pymysql.cursors.DictCursor, # Rows are returned as dictionaries 
    "autocommit": True
}

def get_conn():
    """Create a new DB connection."""
    return pymysql.connect(**DB_CONFIG)

#  CREATE 
# Adds a new employee to the database 
@app.route("/employees", methods=["POST"])
def create_employee():
    data = request.get_json(force=True)    # JSON data sent from react 
    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    email = data.get("Email")
    department = data.get("Department")
    gender = data.get("Gender")
    location = data.get("Location")
    office_address = data.get("OfficeAddress")

    if not (first_name and last_name and email):   # Cheacking that the fields required are provided
        return jsonify({"error": "FirstName, LastName, and Email are required"}), 400

    try:
        # open connect to the database
        conn = get_conn()
        # Inset employee data into the employee table
        with conn.cursor() as cur:
            cur.execute("""         
                INSERT INTO Employee (FirstName, LastName, Email, Department, Gender, Location, OfficeAddress)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (first_name, last_name, email, department, gender, location, office_address))
            new_id = cur.lastrowid
        return jsonify({"message": "Employee created", "EmployeeID": new_id}), 201
    except Exception as e:
        # if anything does go wrong send back an error
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# READ getting all employyess from the database 
@app.route("/employees", methods=["GET"])
def get_employees():
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EmployeeID, FirstName, LastName, Email, Department, Gender, Location, 
                       OfficeAddress, Username, PasswordHash
                FROM Employee
                ORDER BY EmployeeID DESC
            """)
            rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


# UPDATE 
# Updating employee details in the database
@app.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    data = request.get_json(force=True)
    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    department = data.get("Department")
    location = data.get("Location")
     # ensuring name firelds are filled out 
    if not (first_name and last_name):
        return jsonify({"error": "FirstName and LastName are required"}), 400

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # Updating the record based on the employeeID
            cur.execute("""
                UPDATE Employee
                SET FirstName=%s, LastName=%s, Department=%s, Location=%s
                WHERE EmployeeID=%s
            """, (first_name, last_name, department, location, employee_id))
            affected = cur.rowcount
        if affected == 0:
            return jsonify({"message": "No employee updated (check ID)"}), 404
        return jsonify({"message": "Employee updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# DELETE - Removing an employees from the database 
@app.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("DELETE FROM Employee WHERE EmployeeID=%s", (employee_id,))
            affected = cur.rowcount
        if affected == 0:
            return jsonify({"message": "No employee deleted (check ID)"}), 404
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# -----------------------------------------
# COMMUTE PROFILE ROUTES
# -----------------------------------------

@app.route("/commute-profile", methods=["POST"])
def create_commute_profile():
    data = request.get_json(force=True)

    first_name = data.get("FirstName")
    department = data.get("Department")
    gender = data.get("Gender")
    work_hours = data.get("WorkHours")
    transport_pref = data.get("TransportPreference")
    meetup_location = data.get("MeetupLocation")

    # Validate required fields
    if not (first_name and department and gender and work_hours and transport_pref and meetup_location):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO CommuteProfile 
                (FirstName, Department, Gender, WorkHours, TransportPreference, MeetupLocation)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                first_name,
                department,
                gender,
                work_hours,
                transport_pref,
                meetup_location
            ))

            new_id = cur.lastrowid

        return jsonify({"message": "Commute profile created", "ProfileID": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()



@app.route("/commute-profile", methods=["GET"])
def get_commute_profiles():
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM CommuteProfile
                ORDER BY ProfileID DESC
            """)
            rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@app.route("/register", methods=["POST"])
def register_employee():
    data = request.get_json(force=True)

    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    email = data.get("Email")
    department = data.get("Department")
    gender = data.get("Gender")
    office_address = data.get("OfficeAddress")
    username = data.get("Username")
    password = data.get("Password")

    if not (first_name and last_name and email and username and password):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Employee
                (FirstName, LastName, Email, Department, Gender, OfficeAddress, Username, PasswordHash)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                first_name,
                last_name,
                email,
                department,
                gender,
                office_address,
                username,
                hashed_pw
            ))

        return jsonify({"message": "Employee registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)

    username = data.get("Username")
    password = data.get("Password")

    if not (username and password):
        return jsonify({"error": "Username and password are required"}), 400

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EmployeeID, Username, PasswordHash
                FROM Employee
                WHERE Username = %s
            """, (username,))
            
            user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # check the password
        if not check_password_hash(user["PasswordHash"], password):
            return jsonify({"error": "Incorrect password"}), 401

        return jsonify({
            "message": "Login successful",
            "EmployeeID": user["EmployeeID"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  RUN 
if __name__ == "__main__":
    app.run(debug=True)     # when python app.py is running in my terminal
                            #this runs and starts bacekend locally 
