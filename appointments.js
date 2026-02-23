// appointments.js - appointment-specific logic

// Add a new appointment
function addAppointment(data, readJSON, writeJSON) {
  const appointments = readJSON("appointments.json");
  const appointmentID = appointments.length
    ? appointments[appointments.length - 1].appointmentID + 1
    : 1;
  const newAppointment = {
    appointmentID,
    patientID: data.patientID,
    date: data.date,
    time: data.time,
    doctorName: data.doctorName,
  };
  appointments.push(newAppointment);
  writeJSON("appointments.json", appointments);
  return newAppointment;
}

// Cancel (delete) an appointment by appointmentID
function cancelAppointment(id, readJSON, writeJSON) {
  let appointments = readJSON("appointments.json");
  const idx = appointments.findIndex((a) => a.appointmentID === id);
  if (idx === -1) return false;
  appointments.splice(idx, 1);
  writeJSON("appointments.json", appointments);
  return true;
}

// Check doctor availability: returns true if available, false if already booked at that date+time
function checkDoctorAvailability(doctorName, date, time, readJSON) {
  const appointments = readJSON("appointments.json");
  const conflict = appointments.find(
    (a) =>
      a.doctorName.toLowerCase() === doctorName.toLowerCase() &&
      a.date === date &&
      a.time === time,
  );
  return !conflict;
}

// Get all appointments for a given patient ID
function getAppointmentsByPatientId(patientID, readJSON) {
  const appointments = readJSON("appointments.json");
  return appointments.filter((a) => a.patientID === patientID);
}

module.exports = {
  addAppointment,
  cancelAppointment,
  checkDoctorAvailability,
  getAppointmentsByPatientId,
};
