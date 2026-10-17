from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import pickle
import pymysql

app = Flask(__name__)
app.secret_key = 'szabist_ds_lab_2025'
CORS(app)

# ==================== MYSQL CONFIG ====================
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'victus000',   # change this if your MySQL password is different
    'database': 'prompt_platform',
    'cursorclass': pymysql.cursors.DictCursor
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

model = None
vectorizer = None


def get_db():
    return pymysql.connect(**MYSQL_CONFIG)


def load_ml_files():
    global model, vectorizer

    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

        with open(VECTORIZER_PATH, "rb") as f:
            vectorizer = pickle.load(f)

        print("✅ model.pkl and vectorizer.pkl loaded successfully")

    except Exception as e:
        print("❌ Model loading error:", e)


def predict_category(text):
    if model is None or vectorizer is None:
        return "open_qa"

    try:
        X = vectorizer.transform([text])
        return str(model.predict(X)[0])
    except Exception as e:
        print("Prediction error:", e)
        return "open_qa"


def init_db():
    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT 1")
        print("✅ MySQL Connected Successfully: prompt_platform")
    except Exception as e:
        print("❌ DB Connection Error:", e)
    finally:
        conn.close()


def short_time(value):
    if not value:
        return "Just now"

    return str(value).split(".")[0]


def get_comments_for_prompt(conn, prompt_id):
    with conn.cursor() as c:
        c.execute("""
            SELECT c.id, c.text, c.created_at, u.name AS author
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.prompt_id = %s
            ORDER BY c.id ASC
        """, (prompt_id,))

        rows = c.fetchall()

    comments = []

    for r in rows:
        comments.append({
            "id": r["id"],
            "text": r["text"],
            "author": r["author"],
            "user": r["author"],
            "time": short_time(r["created_at"])
        })

    return comments


def make_prompt_object(row, comments):
    return {
        "id": row["id"],
        "title": row["title"],
        "desc": row.get("description") or row["text"][:120],
        "description": row.get("description") or "",
        "prompt": row["text"],
        "text": row["text"],
        "context": row.get("context") or "",
        "category": row.get("category") or "open_qa",
        "isPremium": bool(row.get("is_premium", 0)),
        "is_premium": bool(row.get("is_premium", 0)),
        "likes": int(row.get("likes", 0)),
        "copies": int(row.get("copies", 0)),
        "comments": comments,
        "author": row.get("author") or "User",
        "authorImg": "user-" + str(row["id"]),
        "time": short_time(row.get("created_at")),
        "userId": row.get("author_email"),
        "author_id": row.get("author_id"),
        "liked": bool(row.get("liked", 0)),
        "saved": bool(row.get("saved", 0))
    }


# ==================== PAGE ROUTES ====================
@app.route('/')
def home():
    return render_template('home.html')


@app.route('/login')
def login_page():
    return render_template('login.html')


@app.route('/signup')
def signup_page():
    return render_template('signup.html')


@app.route('/forgot-password')
@app.route('/forgotpassword')
def forgot_password_page():
    return render_template('forgot-password.html')


# ==================== SIGNUP ====================
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({
            "status": "error",
            "message": "All fields are required"
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing = c.fetchone()

            if existing:
                return jsonify({
                    "status": "error",
                    "message": "Email already exists"
                }), 409

            c.execute("""
                INSERT INTO users (name, email, password)
                VALUES (%s, %s, %s)
            """, (name, email, password))

            user_id = c.lastrowid

        conn.commit()

        return jsonify({
            "status": "success",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "isPro": False
            }
        })

    except Exception as e:
        print("Signup error:", e)

        return jsonify({
            "status": "error",
            "message": "Signup failed. Check MySQL tables."
        }), 500

    finally:
        conn.close()


# ==================== LOGIN ====================
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password required"
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = c.fetchone()
    finally:
        conn.close()

    if not user or user['password'] != password:
        return jsonify({
            "status": "error",
            "message": "Invalid credentials"
        }), 401

    return jsonify({
        "status": "success",
        "user_id": user['id'],
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "isPro": bool(user.get('is_pro', 0))
        }
    })


# ==================== FORGOT PASSWORD ====================
@app.route('/api/forgot-password/check', methods=['POST'])
def forgot_password_check():
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = c.fetchone()
    finally:
        conn.close()

    if not user:
        return jsonify({
            "status": "error",
            "message": "No account found with this email"
        }), 404

    return jsonify({
        "status": "success",
        "message": "Email verified"
    })


@app.route('/api/forgot-password/reset', methods=['POST'])
def forgot_password_reset():
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and new password required"
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                UPDATE users
                SET password = %s
                WHERE email = %s
            """, (password, email))

            updated = c.rowcount

        conn.commit()

    finally:
        conn.close()

    if updated == 0:
        return jsonify({
            "status": "error",
            "message": "No account found with this email"
        }), 404

    return jsonify({
        "status": "success",
        "message": "Password updated"
    })


# ==================== PREDICT ====================
@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}

    text = data.get('text', '').strip()

    if not text:
        return jsonify({
            "status": "error",
            "message": "Text is required"
        }), 400

    category = predict_category(text)

    return jsonify({
        "status": "success",
        "category": category
    })


# ==================== GET PROMPTS ====================
@app.route('/api/prompts', methods=['GET'])
def get_prompts():
    user_id = request.args.get('user_id')

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                SELECT
                    p.id,
                    p.title,
                    p.text,
                    p.context,
                    p.description,
                    p.category,
                    p.is_premium,
                    p.copies,
                    p.author_id,
                    p.created_at,
                    u.name AS author,
                    u.email AS author_email,
                    (SELECT COUNT(*) FROM likes l WHERE l.prompt_id = p.id) AS likes,
                    (SELECT COUNT(*) FROM likes ul WHERE ul.prompt_id = p.id AND ul.user_id = %s) AS liked,
                    (SELECT COUNT(*) FROM saved_prompts sp WHERE sp.prompt_id = p.id AND sp.user_id = %s) AS saved
                FROM prompts p
                JOIN users u ON p.author_id = u.id
                ORDER BY p.id DESC
            """, (user_id or 0, user_id or 0))

            rows = c.fetchall()

        prompt_list = []

        for row in rows:
            comments = get_comments_for_prompt(conn, row["id"])
            prompt_list.append(make_prompt_object(row, comments))

        return jsonify({
            "status": "success",
            "prompts": prompt_list
        })

    except Exception as e:
        print("Get prompts error:", e)

        return jsonify({
            "status": "error",
            "message": "Could not load prompts"
        }), 500

    finally:
        conn.close()


# ==================== ADD PROMPT ====================
@app.route('/add_prompt', methods=['POST'])
@app.route('/api/add_prompt', methods=['POST'])
@app.route('/api/prompts', methods=['POST'])
def add_prompt():
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    text = data.get('text', '').strip()
    context = data.get('context', '').strip()
    description = data.get('description', '').strip()
    user_id = data.get('user_id')
    is_premium = 1 if data.get('is_premium') else 0

    if not title or not text or not user_id:
        return jsonify({
            "status": "error",
            "message": "Title, prompt text, and user id are required"
        }), 400

    category = predict_category(text)

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            user = c.fetchone()

            if not user:
                return jsonify({
                    "status": "error",
                    "message": "User not found. Please login again."
                }), 401

            c.execute("""
                INSERT INTO prompts
                (title, text, context, description, category, is_premium, copies, author_id)
                VALUES (%s, %s, %s, %s, %s, %s, 0, %s)
            """, (
                title,
                text,
                context,
                description,
                category,
                is_premium,
                user_id
            ))

            prompt_id = c.lastrowid

            c.execute("""
                SELECT
                    p.id,
                    p.title,
                    p.text,
                    p.context,
                    p.description,
                    p.category,
                    p.is_premium,
                    p.copies,
                    p.author_id,
                    p.created_at,
                    u.name AS author,
                    u.email AS author_email,
                    0 AS likes,
                    0 AS liked,
                    0 AS saved
                FROM prompts p
                JOIN users u ON p.author_id = u.id
                WHERE p.id = %s
            """, (prompt_id,))

            row = c.fetchone()

        conn.commit()

        return jsonify({
            "status": "success",
            "prompt": make_prompt_object(row, [])
        })

    except Exception as e:
        conn.rollback()
        print("Add prompt error:", e)

        return jsonify({
            "status": "error",
            "message": "Prompt was not saved. Check MySQL prompt table columns."
        }), 500

    finally:
        conn.close()


# ==================== LIKE ====================
@app.route('/api/prompts/<int:prompt_id>/like', methods=['POST'])
def toggle_like(prompt_id):
    data = request.get_json() or {}

    user_id = data.get('user_id')

    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Login required"
        }), 401

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                SELECT id FROM likes
                WHERE user_id = %s AND prompt_id = %s
            """, (user_id, prompt_id))

            existing = c.fetchone()

            if existing:
                c.execute("""
                    DELETE FROM likes
                    WHERE user_id = %s AND prompt_id = %s
                """, (user_id, prompt_id))

                liked = False
            else:
                c.execute("""
                    INSERT INTO likes (user_id, prompt_id)
                    VALUES (%s, %s)
                """, (user_id, prompt_id))

                liked = True

            c.execute("""
                SELECT COUNT(*) AS total
                FROM likes
                WHERE prompt_id = %s
            """, (prompt_id,))

            likes = c.fetchone()["total"]

        conn.commit()

        return jsonify({
            "status": "success",
            "liked": liked,
            "likes": likes
        })

    except Exception as e:
        conn.rollback()
        print("Like error:", e)

        return jsonify({
            "status": "error",
            "message": "Like failed"
        }), 500

    finally:
        conn.close()


# ==================== SAVE ====================
@app.route('/api/prompts/<int:prompt_id>/save', methods=['POST'])
def toggle_save(prompt_id):
    data = request.get_json() or {}

    user_id = data.get('user_id')

    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Login required"
        }), 401

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                SELECT id FROM saved_prompts
                WHERE user_id = %s AND prompt_id = %s
            """, (user_id, prompt_id))

            existing = c.fetchone()

            if existing:
                c.execute("""
                    DELETE FROM saved_prompts
                    WHERE user_id = %s AND prompt_id = %s
                """, (user_id, prompt_id))

                saved = False
            else:
                c.execute("""
                    INSERT INTO saved_prompts (user_id, prompt_id)
                    VALUES (%s, %s)
                """, (user_id, prompt_id))

                saved = True

        conn.commit()

        return jsonify({
            "status": "success",
            "saved": saved
        })

    except Exception as e:
        conn.rollback()
        print("Save error:", e)

        return jsonify({
            "status": "error",
            "message": "Save failed"
        }), 500

    finally:
        conn.close()


# ==================== COMMENT ====================
@app.route('/api/prompts/<int:prompt_id>/comments', methods=['POST'])
def add_comment(prompt_id):
    data = request.get_json() or {}

    user_id = data.get('user_id')
    text = data.get('text', '').strip()

    if not user_id or not text:
        return jsonify({
            "status": "error",
            "message": "Comment text and login required"
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                INSERT INTO comments (text, user_id, prompt_id)
                VALUES (%s, %s, %s)
            """, (text, user_id, prompt_id))

            comment_id = c.lastrowid

            c.execute("""
                SELECT c.id, c.text, c.created_at, u.name AS author
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = %s
            """, (comment_id,))

            row = c.fetchone()

        conn.commit()

        return jsonify({
            "status": "success",
            "comment": {
                "id": row["id"],
                "text": row["text"],
                "author": row["author"],
                "user": row["author"],
                "time": short_time(row["created_at"])
            }
        })

    except Exception as e:
        conn.rollback()
        print("Comment error:", e)

        return jsonify({
            "status": "error",
            "message": "Comment failed"
        }), 500

    finally:
        conn.close()


# ==================== COPY ====================
@app.route('/api/prompts/<int:prompt_id>/copy', methods=['POST'])
def copy_prompt(prompt_id):
    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                UPDATE prompts
                SET copies = copies + 1
                WHERE id = %s
            """, (prompt_id,))

            c.execute("""
                SELECT copies
                FROM prompts
                WHERE id = %s
            """, (prompt_id,))

            row = c.fetchone()

        conn.commit()

        if not row:
            return jsonify({
                "status": "error",
                "message": "Prompt not found"
            }), 404

        return jsonify({
            "status": "success",
            "copies": row["copies"]
        })

    except Exception as e:
        conn.rollback()
        print("Copy error:", e)

        return jsonify({
            "status": "error",
            "message": "Copy failed"
        }), 500

    finally:
        conn.close()


# ==================== STATS ====================
@app.route('/api/stats')
def stats():
    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT COUNT(*) AS c FROM users")
            users = c.fetchone()['c']

            c.execute("SELECT COUNT(*) AS c FROM prompts")
            prompts_count = c.fetchone()['c']

            c.execute("SELECT COUNT(*) AS c FROM likes")
            likes_count = c.fetchone()['c']

            c.execute("SELECT COALESCE(SUM(copies), 0) AS c FROM prompts")
            copies_count = c.fetchone()['c']

        return jsonify({
            "status": "success",
            "stats": {
                "users": users,
                "prompts": prompts_count,
                "likes": likes_count,
                "copies": int(copies_count)
            }
        })

    finally:
        conn.close()

# ==================== PRO PAYMENT / UPGRADE ====================
@app.route('/api/pro/upgrade', methods=['POST'])
def upgrade_to_pro():
    data = request.get_json() or {}

    user_id = data.get('user_id')
    plan_name = data.get('plan_name', 'Monthly Pro')
    amount = data.get('amount', 999)
    payment_method = data.get('payment_method', 'Demo Card')
    transaction_id = data.get('transaction_id', '')

    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Login required"
        }), 401

    if not transaction_id:
        return jsonify({
            "status": "error",
            "message": "Transaction ID is required"
        }), 400

    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            user = c.fetchone()

            if not user:
                return jsonify({
                    "status": "error",
                    "message": "User not found"
                }), 404

            c.execute("""
                INSERT INTO payments
                (user_id, plan_name, amount, payment_method, transaction_id, status)
                VALUES (%s, %s, %s, %s, %s, 'success')
            """, (
                user_id,
                plan_name,
                amount,
                payment_method,
                transaction_id
            ))

            c.execute("""
                UPDATE users
                SET is_pro = 1,
                    pro_started_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (user_id,))

        conn.commit()

        return jsonify({
            "status": "success",
            "message": "Payment successful. Pro activated.",
            "user": {
                "id": int(user_id),
                "isPro": True
            }
        })

    except Exception as e:
        conn.rollback()
        print("Pro upgrade error:", e)

        return jsonify({
            "status": "error",
            "message": "Payment failed. Check payments table."
        }), 500

    finally:
        conn.close()

##=============PAYMENTS===============
@app.route('/api/pro/status/<int:user_id>', methods=['GET'])
def pro_status(user_id):
    conn = get_db()

    try:
        with conn.cursor() as c:
            c.execute("""
                SELECT id, name, email, is_pro, pro_started_at
                FROM users
                WHERE id = %s
            """, (user_id,))

            user = c.fetchone()

            if not user:
                return jsonify({
                    "status": "error",
                    "message": "User not found"
                }), 404

            c.execute("""
                SELECT id, plan_name, amount, payment_method, transaction_id, status, created_at
                FROM payments
                WHERE user_id = %s
                ORDER BY id DESC
            """, (user_id,))

            payments = c.fetchall()

        return jsonify({
            "status": "success",
            "isPro": bool(user["is_pro"]),
            "pro_started_at": str(user["pro_started_at"]) if user["pro_started_at"] else None,
            "payments": payments
        })

    finally:
        conn.close()
if __name__ == '__main__':
    load_ml_files()
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)