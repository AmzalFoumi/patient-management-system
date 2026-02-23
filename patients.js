// patients.js - patient-specific logic
function addPatient(data, readJSON, writeJSON) {
    const patients = readJSON('patients.json');
    const patientID = patients.length ? patients[patients.length - 1].patientID + 1 : 1;
    const newPatient = {
        patientID,
        name: data.name,
        NIC: data.NIC,
        age: data.age,
        address: data.address,
        previousCaseHistory: data.previousCaseHistory || [],
        lastAgeUpdate: new Date().toISOString().slice(0, 10)
    };
    patients.push(newPatient);
    writeJSON('patients.json', patients);
    return newPatient;
}

module.exports = {
    addPatient
};