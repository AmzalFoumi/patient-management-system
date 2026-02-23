const http = require("http");
const fs = require("fs");
const path = require("path");
const patients = require("./patients");

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
  // Add a patient
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

  // Get all patients
  if (req.method === "GET" && req.url === "/patients") {
    const allPatients = patients.getAllPatients(readJSON, writeJSON);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(allPatients));
    return;
  }

  // Delete a patient by ID (e.g., /patients/1)
  if (req.method === "DELETE" && req.url.startsWith("/patients/")) {
    const id = parseInt(req.url.split("/")[2]);
    if (isNaN(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid patient ID" }));
      return;
    }
    const deleted = patients.deletePatient(id, readJSON, writeJSON);
    if (deleted) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Patient deleted" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Patient not found" }));
    }
    return;
  }

  // Change address for a patient (PUT /patients/:id/address)
  if (
    req.method === "PUT" &&
    req.url.startsWith("/patients/") &&
    req.url.endsWith("/address")
  ) {
    const parts = req.url.split("/");
    const id = parseInt(parts[2]);
    if (isNaN(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid patient ID" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      if (!data.address) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing address" }));
        return;
      }
      const changed = patients.changeAddress(
        id,
        data.address,
        readJSON,
        writeJSON,
      );
      if (changed) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Address updated" }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Patient not found" }));
      }
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
