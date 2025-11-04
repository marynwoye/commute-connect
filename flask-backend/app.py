# app.py — Flask backend for Commute & Connect (CRUD for Employees)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

# ---- Flask app & CORS ----
app = Flask(__name__)
CORS(app)  # allow all origins (React can connect from any local port)

# ---------- HEALTH CHECK ----------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

# ---------- MySQL connection settings ----------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Nwoye2025",  # your MySQL root password
    "database": "commute_connect_v2",  # your new database
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": True
}

def get_conn():
    """Create a new DB connection."""
    return pymysql.connect(**DB_CONFIG)

# ---------- CREATE ----------
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
        try:
            conn.close()
        except:
            pass

# ---------- READ ----------
@app.route("/employees", methods=["GET"])
def get_employees():
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Employee ORDER BY EmployeeID DESC")
            rows = cur.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# ---------- UPDATE ----------
@app.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    data = request.get_json(force=True)
    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    department = data.get("Department")
    location = data.get("Location")

    if not (first_name and last_name):
        return jsonify({"error": "FirstName and LastName are required"}), 400

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
        try:
            conn.close()
        except:
            pass

# ---------- DELETE ----------
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

# ----------- RUN -----------
if __name__ == "__main__":
    app.run(debug=True)
