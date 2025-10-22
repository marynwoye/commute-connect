# app.py — Flask backend for Commute & Connect (CRUD for users)

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

# ---- MySQL connection settings ----
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Nwoye2025",  # your MySQL root password
    "database": "commute_connect",
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": True
}

def get_conn():
    """Create a new DB connection."""
    return pymysql.connect(**DB_CONFIG)

# ---------- CREATE ----------
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json(force=True)
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (name, email) VALUES (%s, %s)",
                (name, email)
            )
            new_id = cur.lastrowid
        return jsonify({"message": "User created", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# ---------- READ ----------
@app.route("/users", methods=["GET"])
def get_users():
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email FROM users ORDER BY id DESC")
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
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json(force=True)
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET name=%s, email=%s WHERE id=%s",
                (name, email, user_id)
            )
            conn.commit()  # ✅ ensure the change is saved
            changed = cur.rowcount
        if changed == 0:
            return jsonify({"message": "No user updated (check id)"}), 404
        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        print("UPDATE ERROR:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass

# ---------- DELETE ----------
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE id=%s", (user_id,))
            changed = cur.rowcount
        if changed == 0:
            return jsonify({"message": "No user deleted (check id)"}), 404
        return jsonify({"message": "User deleted"}), 200
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
