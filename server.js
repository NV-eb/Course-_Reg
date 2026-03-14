const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = 'eduverse.db';

// --- DATABASE SETUP ---

// Function to initialize the database from the SQL schema file
function initializeDatabase() {
  const sqlScript = fs.readFileSync('sql_tables.sql').toString();
  db.exec(sqlScript, (err) => {
    if (err) {
      console.error("Error initializing database:", err.message);
    } else {
      console.log("Database initialized successfully with schema.");
    }
    // Note: We don't close the DB here as the server needs it.
  });
}

// Check if the database file exists. If not, create it and initialize the schema.
const dbExists = fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to the ${DB_FILE} database.`);
    if (!dbExists) {
      console.log("Database file not found, creating and initializing...");
      initializeDatabase();
    }
  }
});


// --- MIDDLEWARE ---

// Serve static files (like index.html, css, etc.) from the current directory
app.use(express.static(path.join(__dirname)));
// Parse JSON bodies from incoming requests
app.use(express.json());


// --- API ENDPOINT ---

app.post('/register', (req, res) => {
  console.log("Received registration data:", req.body);
  const { STUDENT, DEPARTMENT, FACULTY, COURSE, REGISTRATION } = req.body;

  // We use a transaction to ensure all queries succeed or none do.
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');

    // Use "INSERT OR IGNORE" to avoid errors if a record (like a department or student)
    // already exists. This makes the operation idempotent for non-registration data.
    const queries = [
      { sql: 'INSERT OR IGNORE INTO DEPARTMENT (Department_ID, Department_Name, HOD_Name, Building) VALUES (?, ?, ?, ?)', params: [DEPARTMENT.Department_ID, DEPARTMENT.Department_Name, DEPARTMENT.HOD_Name, DEPARTMENT.Building] },
      { sql: 'INSERT OR IGNORE INTO FACULTY (Faculty_ID, Faculty_Name, Email, Phone, Department_ID, Specialization) VALUES (?, ?, ?, ?, ?, ?)', params: [FACULTY.Faculty_ID, FACULTY.Faculty_Name, FACULTY.Email, FACULTY.Phone, FACULTY.Department_ID, FACULTY.Specialization] },
      { sql: 'INSERT OR IGNORE INTO STUDENT (Student_ID, Name, Email, Phone, Date_of_Birth, Department_ID) VALUES (?, ?, ?, ?, ?, ?)', params: [STUDENT.Student_ID, STUDENT.Name, STUDENT.Email, STUDENT.Phone, STUDENT.Date_of_Birth, STUDENT.Department_ID] },
      { sql: 'INSERT OR IGNORE INTO COURSE (Course_ID, Course_Name, Credits, Department_ID, Faculty_ID, Max_Capacity) VALUES (?, ?, ?, ?, ?, ?)', params: [COURSE.Course_ID, COURSE.Course_Name, COURSE.Credits, COURSE.Department_ID, COURSE.Faculty_ID, COURSE.Max_Capacity] },
      // The REGISTRATION record should always be new, so we use a standard INSERT.
      { sql: 'INSERT INTO REGISTRATION (Registration_ID, Student_ID, Course_ID, Semester, Year, Grade, Registration_Date) VALUES (?, ?, ?, ?, ?, ?, ?)', params: [REGISTRATION.Registration_ID, REGISTRATION.Student_ID, REGISTRATION.Course_ID, REGISTRATION.Semester, REGISTRATION.Year, REGISTRATION.Grade, REGISTRATION.Registration_Date] },
    ];

    let hadError = false;
    queries.forEach(q => {
      db.run(q.sql, q.params, function(err) {
        if (err) {
          console.error('Error executing query:', q.sql, err.message);
          hadError = true;
        }
      });
    });

    if (hadError) {
      db.run('ROLLBACK;');
      res.status(500).json({ success: false, message: 'Failed to save registration data.' });
    } else {
      db.run('COMMIT;');
      console.log('Registration data committed to database successfully!');
      res.status(201).json({ success: true, message: 'Registration successful!', registrationId: REGISTRATION.Registration_ID });
    }
  });
});

// --- START SERVER ---

app.listen(PORT, () => {
  console.log(`EduVerse server running at http://localhost:${PORT}`);
});