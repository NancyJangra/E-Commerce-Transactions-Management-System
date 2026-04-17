# 🛒 E-Commerce Transactions Management System

A **Database Management System (DBMS)** project that provides a web‑based dashboard for an e‑commerce platform. It allows managers to view customers, products, orders, generate sales reports with charts, and analyse inventory health (low‑profit products & never‑sold items).

## 🚀 Features

- **Customer Management** – View, search, and load all customers.
- **Product Inventory** – Searchable product list with categories and prices.
- **Order Tracking** – View recent orders, order status badges, and click to see detailed items per order.
- **Sales Report** – Interactive bar chart (sales by category) and pie chart (profit distribution) with a detailed table.
- **Inventory Insights** – Identify:
  - Low‑profit products (profit margin < 10%)
  - Products that have never been sold
  - Sell‑through rate summary
- **Responsive UI** – Modern gradient design, card shadows, and mobile‑friendly layout.
- **Secure Database Connection** – Uses `.env` file to keep credentials out of version control.

## 🛠️ Technologies Used

| Layer       | Technology |
|-------------|------------|
| **Backend** | Python, Flask, MySQL Connector |
| **Frontend**| HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js |
| **Database**| MySQL |
| **Tools**   | Git, GitHub, pip, Virtual Environment |

## 📁 Dataset

The project uses the **E‑Commerce Transactions Dataset** from Kaggle (synthetic data).  
🔗 **Dataset Link:** [E-Commerce Transactions Dataset](https://www.kaggle.com/datasets/zahidulislamturjo/e-commerce-transactions-dataset) 
It contains four tables with over **5000+ records**:

- `customers` (~1,000 rows)
- `products` (~500 rows)
- `orders` (~5,000 rows)
- `order_items` (~15,000 rows)

## 🧰 Prerequisites

Before running this project, ensure you have:

- **Python 3.8+** installed ([python.org](https://python.org))
- **MySQL Server** installed ([mysql.com](https://mysql.com))
- **Git** (optional, for cloning)

## ⚙️ Installation & Setup

Follow these steps to run the project on your local machine.

### 1. Clone the repository

```bash
git clone https://github.com/NancyJangra/E-Commerce-Transactions-Management-System.git
cd E-Commerce-Transactions-Management-System
