# app.py My Flask backend for commute and connect 
# This file runs my backend server and connect to mySQL database
# It provides the CRUD operations for employee data. (Used in Enviroment)

from flask import Flask, request, jsonify  # Flask is for bulidings APIS
from flask_cors import CORS                # CORS lets React talk to Flask
import pymysql   


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


# routes for commute profiles 
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


# GET all commute profiles - used to show the pins on the map
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

# login routes 
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

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Employee
                (FirstName, LastName, Email, Department, Gender, OfficeAddress, Username, Password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                first_name,
                last_name,
                email,
                department,
                gender,
                office_address,
                username,
                password
            ))

        return jsonify({"message": "Employee registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


# POST login validating usernames and passwords (plain text MVP)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)

    username = data.get("Username")
    password = data.get("Password")

    if not (username and password):
        return jsonify({"error": "Username and password are required"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT EmployeeID, FirstName, LastName, Username, Password
                FROM Employee
                WHERE Username = %s
            """, (username,))
            
            user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # plain text password check (MVP)
        if user["Password"] != password:
            return jsonify({"error": "Incorrect password"}), 401

        return jsonify({
            "message": "Login successful",
            "EmployeeID": user["EmployeeID"],
            "FirstName": user["FirstName"],
            "LastName": user["LastName"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@app.route("/commute-groups", methods=["GET"])
def get_commute_groups():
    group_type = request.args.get("type")  # 'carpool', 'walk', 'luas' or None

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            if group_type:
                cur.execute("""
                    SELECT
                      g.GroupID, g.GroupType, g.GroupName,
                      g.MeetPointName, g.MeetLat, g.MeetLng,
                      g.DaysOfWeek, g.MeetTime, g.MaxMembers,
                      g.CreatorEmployeeID,
                      e.FirstName AS CreatorFirstName,
                      e.LastName AS CreatorLastName,
                      e.Email AS CreatorEmail
                    FROM CommuteGroupV2 g
                    JOIN Employee e ON e.EmployeeID = g.CreatorEmployeeID
                    WHERE g.GroupType = %s
                    ORDER BY g.GroupID DESC
                """, (group_type,))
            else:
                cur.execute("""
                    SELECT
                      g.GroupID, g.GroupType, g.GroupName,
                      g.MeetPointName, g.MeetLat, g.MeetLng,
                      g.DaysOfWeek, g.MeetTime, g.MaxMembers,
                      g.CreatorEmployeeID,
                      e.FirstName AS CreatorFirstName,
                      e.LastName AS CreatorLastName,
                      e.Email AS CreatorEmail
                    FROM CommuteGroupV2 g
                    JOIN Employee e ON e.EmployeeID = g.CreatorEmployeeID
                    ORDER BY g.GroupID DESC
                """)
            groups = cur.fetchall()

            # Add CurrentMembers count
            for g in groups:
                cur.execute("SELECT COUNT(*) AS cnt FROM GroupMemberV2 WHERE GroupID=%s", (g["GroupID"],))
                g["CurrentMembers"] = cur.fetchone()["cnt"]

        return jsonify(groups), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()

@app.route("/commute-groups/<int:group_id>/members", methods=["GET"])
def get_group_members(group_id):
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT e.EmployeeID, e.FirstName, e.LastName, e.Department
                FROM GroupMemberV2 gm
                JOIN Employee e ON e.EmployeeID = gm.EmployeeID
                WHERE gm.GroupID = %s
                ORDER BY e.LastName, e.FirstName
            """, (group_id,))
            members = cur.fetchall()

        return jsonify(members), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()

@app.route("/commute-groups/<int:group_id>/join", methods=["POST"])
def join_group(group_id):
    data = request.get_json(force=True)
    employee_id = data.get("EmployeeID")

    if not employee_id:
        return jsonify({"error": "EmployeeID is required"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # Check group exists
            cur.execute("SELECT MaxMembers FROM CommuteGroupV2 WHERE GroupID=%s", (group_id,))
            group = cur.fetchone()
            if not group:
                return jsonify({"error": "Group not found"}), 404

            # Check already a member
            cur.execute("""
                SELECT 1 FROM GroupMemberV2
                WHERE GroupID=%s AND EmployeeID=%s
            """, (group_id, employee_id))
            if cur.fetchone():
                return jsonify({"error": "You are already a member of this group"}), 409

            # Check capacity
            cur.execute("SELECT COUNT(*) AS cnt FROM GroupMemberV2 WHERE GroupID=%s", (group_id,))
            current = cur.fetchone()["cnt"]
            if current >= group["MaxMembers"]:
                return jsonify({"error": "Group is full"}), 409

            # Add member
            cur.execute("""
                INSERT INTO GroupMemberV2 (GroupID, EmployeeID)
                VALUES (%s, %s)
            """, (group_id, employee_id))

        return jsonify({"message": "Joined group successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()

@app.route("/commute-groups", methods=["POST"])
def create_commute_group():
    data = request.get_json(force=True)

    group_type = data.get("GroupType")          # 'carpool', 'walk', 'luas'
    group_name = data.get("GroupName")
    meet_point = data.get("MeetPointName")
    days = data.get("DaysOfWeek")               # e.g. "Mon,Tue,Thu"
    meet_time = data.get("MeetTime")            # e.g. "08:10"
    max_members = data.get("MaxMembers")
    creator_id = data.get("CreatorEmployeeID")

    # Basic validation
    if not (group_type and group_name and meet_point and days and meet_time and max_members and creator_id):
        return jsonify({"error": "Missing required fields"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # Insert into CommuteGroupV2 (MeetLat/MeetLng are NULL in Option A)
            cur.execute("""
                INSERT INTO CommuteGroupV2
                (GroupType, GroupName, MeetPointName, MeetLat, MeetLng, DaysOfWeek, MeetTime, MaxMembers, CreatorEmployeeID)
                VALUES (%s, %s, %s, NULL, NULL, %s, %s, %s, %s)
            """, (
                group_type, group_name, meet_point, days, meet_time, int(max_members), int(creator_id)
            ))
            new_group_id = cur.lastrowid

            # Add creator as first member
            cur.execute("""
                INSERT INTO GroupMemberV2 (GroupID, EmployeeID)
                VALUES (%s, %s)
            """, (new_group_id, int(creator_id)))

        return jsonify({"message": "Group created", "GroupID": new_group_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


#  RUN 
if __name__ == "__main__":
    app.run(debug=True)     
                            #this runs and starts bacekend locally 
