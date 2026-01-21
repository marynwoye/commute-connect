# app.py My Flask backend for commute and connect
# This file runs my backend server and connects to MySQL database
# It provides CRUD operations + commute group features

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

# HEALTH CHECK
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


# MySQL connection settings
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Nwoye2025",
    "database": "commute_connect_v2",
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": True
}

def get_conn():
    """Create a new DB connection."""
    return pymysql.connect(**DB_CONFIG)


# =========================
# EMPLOYEE CRUD
# =========================

@app.route("/employees", methods=["POST"])
def create_employee():
    data = request.get_json(force=True)

    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    email = data.get("Email")
    department = data.get("Department")
    gender = data.get("Gender")
    location = data.get("Location")
    office_address = data.get("OfficeAddress")

    if not (first_name and last_name and email):
        return jsonify({"error": "FirstName, LastName, and Email are required"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Employee (FirstName, LastName, Email, Department, Gender, Location, OfficeAddress)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (first_name, last_name, email, department, gender, location, office_address))
            new_id = cur.lastrowid

        return jsonify({"message": "Employee created", "EmployeeID": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@app.route("/employees", methods=["GET"])
def get_employees():
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # ✅ FIX: use Password not PasswordHash
            cur.execute("""
                SELECT EmployeeID, FirstName, LastName, Email, Department, Gender, Location,
                       OfficeAddress, Username, Password
                FROM Employee
                ORDER BY EmployeeID DESC
            """)
            rows = cur.fetchall()

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@app.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    data = request.get_json(force=True)

    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    department = data.get("Department")
    location = data.get("Location")

    if not (first_name and last_name):
        return jsonify({"error": "FirstName and LastName are required"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
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
        if conn:
            conn.close()


@app.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    conn = None
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
        if conn:
            conn.close()


# =========================
# COMMUTE PROFILES
# =========================

@app.route("/commute-profile", methods=["POST"])
def create_commute_profile():
    data = request.get_json(force=True)

    first_name = data.get("FirstName")
    department = data.get("Department")
    gender = data.get("Gender")
    work_hours = data.get("WorkHours")
    transport_pref = data.get("TransportPreference")
    meetup_location = data.get("MeetupLocation")

    if not (first_name and department and gender and work_hours and transport_pref and meetup_location):
        return jsonify({"error": "Missing required fields"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO CommuteProfile
                (FirstName, Department, Gender, WorkHours, TransportPreference, MeetupLocation)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (first_name, department, gender, work_hours, transport_pref, meetup_location))

            new_id = cur.lastrowid

        return jsonify({"message": "Commute profile created", "ProfileID": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@app.route("/commute-profile", methods=["GET"])
def get_commute_profiles():
    conn = None
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
        if conn:
            conn.close()


# =========================
# AUTH (plain text MVP)
# =========================

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
            """, (first_name, last_name, email, department, gender, office_address, username, password))

        return jsonify({"message": "Employee registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


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


# =========================
# COMMUTE GROUPS (V2) + FILTERING
# =========================

@app.route("/commute-groups", methods=["GET"])
def get_commute_groups():
    group_type = request.args.get("type")          # carpool / walk / luas
    gender = request.args.get("gender")            # Male / Female / Other
    department = request.args.get("department")    # IT / Audit / etc.
    location_q = request.args.get("location")      # text search in MeetPointName

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            sql = """
                SELECT
                  g.GroupID, g.GroupType, g.GroupName,
                  g.MeetPointName, g.MeetLat, g.MeetLng,
                  g.DaysOfWeek, g.MeetTime, g.MaxMembers,
                  g.CreatorEmployeeID,
                  e.FirstName AS CreatorFirstName,
                  e.LastName AS CreatorLastName,
                  e.Email AS CreatorEmail,
                  e.Gender AS CreatorGender,
                  e.Department AS CreatorDepartment
                FROM CommuteGroupV2 g
                JOIN Employee e ON e.EmployeeID = g.CreatorEmployeeID
                WHERE 1=1
            """
            params = []

            if group_type:
                sql += " AND g.GroupType = %s"
                params.append(group_type)

            if gender:
                sql += " AND e.Gender = %s"
                params.append(gender)

            if department:
                sql += " AND e.Department = %s"
                params.append(department)

            if location_q:
                sql += " AND g.MeetPointName LIKE %s"
                params.append(f"%{location_q}%")

            sql += " ORDER BY g.GroupID DESC"

            cur.execute(sql, params)
            groups = cur.fetchall()

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
            cur.execute("SELECT MaxMembers FROM CommuteGroupV2 WHERE GroupID=%s", (group_id,))
            group = cur.fetchone()
            if not group:
                return jsonify({"error": "Group not found"}), 404

            cur.execute("""
                SELECT 1 FROM GroupMemberV2
                WHERE GroupID=%s AND EmployeeID=%s
            """, (group_id, employee_id))
            if cur.fetchone():
                return jsonify({"error": "You are already a member of this group"}), 409

            cur.execute("SELECT COUNT(*) AS cnt FROM GroupMemberV2 WHERE GroupID=%s", (group_id,))
            current = cur.fetchone()["cnt"]
            if current >= group["MaxMembers"]:
                return jsonify({"error": "Group is full"}), 409

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

    group_type = data.get("GroupType")
    group_name = data.get("GroupName")
    meet_point = data.get("MeetPointName")
    days = data.get("DaysOfWeek")
    meet_time = data.get("MeetTime")
    max_members = data.get("MaxMembers")
    creator_id = data.get("CreatorEmployeeID")

    if not (group_type and group_name and meet_point and days and meet_time and max_members and creator_id):
        return jsonify({"error": "Missing required fields"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO CommuteGroupV2
                (GroupType, GroupName, MeetPointName, MeetLat, MeetLng, DaysOfWeek, MeetTime, MaxMembers, CreatorEmployeeID)
                VALUES (%s, %s, %s, NULL, NULL, %s, %s, %s, %s)
            """, (group_type, group_name, meet_point, days, meet_time, int(max_members), int(creator_id)))

            new_group_id = cur.lastrowid

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


@app.route("/commute-groups/<int:group_id>/leave", methods=["DELETE"])
def leave_group(group_id):
    employee_id = request.args.get("employeeId")

    if not employee_id:
        return jsonify({"error": "employeeId is required"}), 400

    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # Check membership exists
            cur.execute("""
                SELECT 1 FROM GroupMemberV2
                WHERE GroupID=%s AND EmployeeID=%s
            """, (group_id, employee_id))
            if not cur.fetchone():
                return jsonify({"error": "You are not a member of this group"}), 404

            # Prevent creator leaving their own group (optional rule)
            cur.execute("""
                SELECT CreatorEmployeeID FROM CommuteGroupV2
                WHERE GroupID=%s
            """, (group_id,))
            group = cur.fetchone()
            if group and int(group["CreatorEmployeeID"]) == int(employee_id):
                return jsonify({"error": "Creator cannot leave their own group"}), 409

            # Delete membership
            cur.execute("""
                DELETE FROM GroupMemberV2
                WHERE GroupID=%s AND EmployeeID=%s
            """, (group_id, employee_id))

        return jsonify({"message": "Left group successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    app.run(debug=True)
