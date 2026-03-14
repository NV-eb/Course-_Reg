# EduVerse - Course Registration App

Simple course registration web app using **Node.js**, **Express**, and **mySQL**.

## Requirements

- Node.js
- npm

## Setup

1. Clone the repository

```bash
git clone https://github.com/NV-eb/Course-_Reg
```

2. Navigate to the project folder

```bash
cd path/to/Course-_Reg
````

3. Initialize the Node project

```bash
npm init -y
```

4. Install dependencies

```bash
npm install express sqlite3
```

## Run the Server

```bash
node server.js
```

Expected output:

```
Connected to the eduverse.db database.
Database initialized successfully.
EduVerse server running at http://localhost:3000
```

A new file `eduverse.db` will be created automatically.

## Use the App

1. Open your browser
2. Go to:

```
http://localhost:3000
```

3. Register for a course using the form.

## View Stored Data

Use **DB Browser for SQLite**:

[https://sqlitebrowser.org/](https://sqlitebrowser.org/)

Steps:

1. Open `eduverse.db`
2. Go to **Browse Data**
3. Select tables like:

   * `STUDENT`
   * `COURSE`
   * `REGISTRATION`

You will see the submitted form data stored in the database.