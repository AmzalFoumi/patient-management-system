const http = require("http");
const fs = require("fs");
const path = require("path");
const patients = require('./patients');

// Helper functions to simulate the external database
//I am using two JSON files to store the information. The helper functions below will be used when needing to read or write
function readJSON(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return data ? JSON.parse(data) : [];
}

function writeJSON(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const PORT = 3000;

const server = http.createServer((req, res) => {
  //Add a patient
  if (req.method === "POST" && req.url === "/patients") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      // Use addPatient from patients.js, passing helpers
      const newPatient = patients.addPatient(data, readJSON, writeJSON);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newPatient));
    });
    return;
  }

  //Default response in the case of no routes matching
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Patient Management System API" }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
