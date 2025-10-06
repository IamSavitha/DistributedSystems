Homework 5: User Management App  
This project is my Homework 5. It is a small full-stack app where backend is FastAPI + MySQL and frontend is React + Redux.
Main goal is to create, read, update and delete users (CRUD).

**1. How to Run Backend**

Go to project folder in terminal:

cd Homework5

Active python virtual env (I used .venv but can use any):

source .venv/bin/activate

Install dependency:

pip install -r requirements.txt

Make sure MySQL is running and database exist:

CREATE DATABASE fastapi_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Change database.py to put your own MySQL username and password.

Run backend with:

uvicorn main:app --reload --port 8000

Open in browser:

Health check: http://127.0.0.1:8000/

Swagger docs: http://127.0.0.1:8000/docs

**2. How to Run Frontend**

Go to client folder:

cd client

Install npm packages:

npm install

Set env var to connect with backend. Create .env file in client/ folder with this line:

REACT_APP_API_BASE=http://127.0.0.1:8000

Start frontend dev server:

npm start

Browser open automatically at http://localhost:3000
. You will see User Management App UI.

**3. Versions used**

Python: 3.10+

FastAPI: 0.115+

SQLAlchemy: 2.0+

Pydantic: 2.5+

MySQL: 8.0

Node.js: 18+ (Node 20 works too)

React: 19.0.0

Redux: 5.0.1

**4. CRUD Testing**

Create User → /api/users POST

List Users → /api/users GET

Update User → /api/users/{id} PUT

Delete User → /api/users/{id} DELETE

Can test these in Swagger UI or using curl in terminal.