const http = require("http");
const fs = require("fs");
const path = require("path");
const patients = require("./patients");
const appointments = require("./appointments");

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
  // Patient Routes

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

  // Get a single patient by ID (GET /patients/:id)
  if (req.method === "GET" && req.url.startsWith("/patients/")) {
    const parts = req.url.split("/");
    // Only match /patients/:id (not /patients/:id/address)
    if (parts.length === 3 && parts[2] && !isNaN(parseInt(parts[2]))) {
      const id = parseInt(parts[2]);
      const patient = patients.getPatientById(id, readJSON, writeJSON);
      if (patient) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(patient));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Patient not found" }));
      }
      return;
    }
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

  // Appointment Routes ──────────────────────────────────

  // Add an appointment
  if (req.method === "POST" && req.url === "/appointments") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      if (!data.patientID || !data.date || !data.time || !data.doctorName) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Missing required fields: patientID, date, time, doctorName",
          }),
        );
        return;
      }
      const newAppointment = appointments.addAppointment(
        data,
        readJSON,
        writeJSON,
      );
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newAppointment));
    });
    return;
  }

  // Get appointments by patient ID (GET /appointments/patient/:patientId)
  if (req.method === "GET" && req.url.startsWith("/appointments/patient/")) {
    const parts = req.url.split("/");
    const patientID = parseInt(parts[3]);
    if (isNaN(patientID)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid patient ID" }));
      return;
    }
    const result = appointments.getAppointmentsByPatientId(patientID, readJSON);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  // Check doctor availability (GET /appointments/doctor-availability?doctorName=&date=&time=)
  if (
    req.method === "GET" &&
    req.url.startsWith("/appointments/doctor-availability")
  ) {
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const doctorName = urlObj.searchParams.get("doctorName");
    const date = urlObj.searchParams.get("date");
    const time = urlObj.searchParams.get("time");
    if (!doctorName || !date || !time) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Missing required query params: doctorName, date, time",
        }),
      );
      return;
    }
    const available = appointments.checkDoctorAvailability(
      doctorName,
      date,
      time,
      readJSON,
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ available }));
    return;
  }

  // Cancel (delete) an appointment by ID (DELETE /appointments/:id)
  if (req.method === "DELETE" && req.url.startsWith("/appointments/")) {
    const id = parseInt(req.url.split("/")[2]);
    if (isNaN(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid appointment ID" }));
      return;
    }
    const cancelled = appointments.cancelAppointment(id, readJSON, writeJSON);
    if (cancelled) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Appointment cancelled" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Appointment not found" }));
    }
    return;
  }

  //Default response in the case of no routes matching
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Patient Management System API" }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
