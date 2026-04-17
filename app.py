from flask import Flask, render_template, request, jsonify
import mysql.connector
from db_config import DB_CONFIG

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# ------------------- MAIN PAGE -------------------
@app.route('/')
def index():
    return render_template('index.html')

# ------------------- CUSTOMERS (with search & load all) -------------------
@app.route('/api/customers')
def get_customers():
    search = request.args.get('search', '')
    load_all = request.args.get('all', 'false').lower() == 'true'
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM customers"
    params = []
    if search:
        query += " WHERE customer_name LIKE %s OR city LIKE %s OR state LIKE %s OR region LIKE %s"
        params = [f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%']
    if not load_all:
        query += " LIMIT 100"
    cursor.execute(query, params)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ------------------- PRODUCTS (with search & load all) -------------------
@app.route('/api/products')
def get_products():
    search = request.args.get('search', '')
    load_all = request.args.get('all', 'false').lower() == 'true'
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM products"
    params = []
    if search:
        query += " WHERE product_name LIKE %s OR category LIKE %s OR sub_category LIKE %s"
        params = [f'%{search}%', f'%{search}%', f'%{search}%']
    if not load_all:
        query += " LIMIT 100"
    cursor.execute(query, params)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ------------------- ORDERS (with search & load all) -------------------
@app.route('/api/orders')
def get_orders():
    search = request.args.get('search', '')
    load_all = request.args.get('all', 'false').lower() == 'true'
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT o.order_id, o.order_date, o.status, c.customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
    """
    params = []
    if search:
        query += " WHERE o.order_id LIKE %s OR c.customer_name LIKE %s"
        params = [f'%{search}%', f'%{search}%']
    query += " ORDER BY o.order_date DESC"
    if not load_all:
        query += " LIMIT 100"
    cursor.execute(query, params)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ------------------- ORDER ITEMS (for modal) -------------------
@app.route('/api/order_items/<order_id>')
def get_order_items(order_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT oi.quantity, oi.sales, oi.profit, p.product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """, (order_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ------------------- SALES REPORT (with charts) -------------------
@app.route('/api/sales_report')
def sales_report():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.category,
               ROUND(SUM(oi.sales), 2) AS total_sales,
               ROUND(SUM(oi.profit), 2) AS total_profit,
               COUNT(DISTINCT oi.order_id) AS order_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.category
        ORDER BY total_sales DESC
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

# ------------------- INVENTORY INSIGHTS (no chart, only low profit & never sold) -------------------
@app.route('/api/inventory_insights')
def inventory_insights():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Low profit products (margin < 10% and sales > 0)
        cursor.execute("""
            SELECT p.product_name,
                   ROUND(COALESCE(SUM(oi.sales), 0), 2) as total_sales,
                   ROUND(COALESCE(SUM(oi.profit), 0), 2) as total_profit,
                   ROUND(CASE 
                       WHEN COALESCE(SUM(oi.sales), 0) = 0 THEN 0
                       ELSE (COALESCE(SUM(oi.profit), 0) / SUM(oi.sales)) * 100
                   END, 2) as profit_margin
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY p.product_id
            HAVING total_sales > 0 AND profit_margin < 10
            ORDER BY profit_margin ASC
            LIMIT 10
        """)
        low_profit = cursor.fetchall()

        # 2. Products never sold (no entry in order_items)
        cursor.execute("""
            SELECT p.product_id, p.product_name, p.category, p.price
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            WHERE oi.product_id IS NULL
            LIMIT 20
        """)
        never_sold = cursor.fetchall()

        # 3. Summary counts
        cursor.execute("SELECT COUNT(*) as total_products FROM products")
        total_products = cursor.fetchone()['total_products']

        cursor.execute("SELECT COUNT(DISTINCT product_id) as sold_products FROM order_items WHERE product_id IS NOT NULL")
        sold_products = cursor.fetchone()['sold_products']

        return jsonify({
            'low_profit': low_profit,
            'never_sold': never_sold,
            'total_products': total_products,
            'sold_products': sold_products
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ------------------- RUN APP -------------------
if __name__ == '__main__':
    app.run(debug=True)