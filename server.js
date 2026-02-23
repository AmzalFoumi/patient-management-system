const http = require("http");
const fs = require("fs");
const path = require("path");

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
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Patient Management System API" }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});
