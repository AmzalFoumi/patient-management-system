// Helper method to Update age for a patient if needed
function updatePatientAge(patient, today = new Date()) {
  if (!patient.lastAgeUpdate) return false;
  const lastUpdate = new Date(patient.lastAgeUpdate);
  let yearsPassed = today.getFullYear() - lastUpdate.getFullYear();
  if (
    yearsPassed > 0 &&
    (today.getMonth() < lastUpdate.getMonth() ||
      (today.getMonth() === lastUpdate.getMonth() &&
        today.getDate() < lastUpdate.getDate()))
  ) {
    yearsPassed--;
  }
  if (yearsPassed > 0) {
    patient.age += yearsPassed;
    patient.lastAgeUpdate = today.toISOString().slice(0, 10);
    return true;
  }
  return false;
}

// Get a single patient by ID, with age update if a year has passed
function getPatientById(id, readJSON, writeJSON) {
  let patients = readJSON("patients.json");
  const patient = patients.find((p) => p.patientID === id);
  if (!patient) return null;
  const today = new Date();
  if (updatePatientAge(patient, today)) {
    writeJSON("patients.json", patients);
  }
  return patient;
}
// patients.js - patient-specific logic
function addPatient(data, readJSON, writeJSON) {
  const patients = readJSON("patients.json");
  const patientID = patients.length
    ? patients[patients.length - 1].patientID + 1
    : 1;
  const newPatient = {
    patientID,
    name: data.name,
    NIC: data.NIC,
    age: data.age,
    address: data.address,
    previousCaseHistory: data.previousCaseHistory || [],
    lastAgeUpdate: new Date().toISOString().slice(0, 10),
  };
  patients.push(newPatient);
  writeJSON("patients.json", patients);
  return newPatient;
}

// Get all patients with optional age update logic
function getAllPatients(readJSON, writeJSON) {
  let patients = readJSON("patients.json");
  const today = new Date();
  let updated = false;
  patients.forEach((patient) => {
    if (updatePatientAge(patient, today)) {
      updated = true;
    }
  });
  if (updated) {
    writeJSON("patients.json", patients);
  }
  return patients;
}

// Delete a patient by ID
function deletePatient(id, readJSON, writeJSON) {
  let patients = readJSON("patients.json");
  const idx = patients.findIndex((p) => p.patientID === id);
  if (idx === -1) return false;
  patients.splice(idx, 1);
  writeJSON("patients.json", patients);
  return true;
}

// Change address for a patient by ID
function changeAddress(id, newAddress, readJSON, writeJSON) {
  let patients = readJSON("patients.json");
  const patient = patients.find((p) => p.patientID === id);
  if (!patient) return false;
  patient.address = newAddress;
  writeJSON("patients.json", patients);
  return true;
}

module.exports = {
  addPatient,
  getAllPatients,
  deletePatient,
  changeAddress,
  getPatientById,
};
