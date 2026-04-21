const runFormQuery = async (sql) => {
  try {
    const url = "https://sbrown635.webhosting1.eeecs.qub.ac.uk/dbConnector.php";
    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({ query: sql })
    });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const result = await response.json();
    return result;

  } catch (error) {
    console.log(error.message);
  }
}

const validateStaff = (staff) => {
  if (!staff || typeof staff !== "object") {
    return "Staff details are required.";
  }

  const staffID = Number(staff.staffID);
  const firstName = typeof staff.firstName === "string" ? staff.firstName.trim() : "";
  const lastName = typeof staff.lastName === "string" ? staff.lastName.trim() : "";
  const email = typeof staff.email === "string" ? staff.email.trim() : "";
  const phone = typeof staff.phone === "string" ? staff.phone.trim() : "";
  const gender = typeof staff.gender === "string" ? staff.gender.trim() : "";
  const role = typeof staff.role === "string" ? staff.role.trim() : "";
  const certifiedDate = typeof staff.certifiedDate === "string" ? staff.certifiedDate.trim() : "";
  const isActive = Number(staff.isActive);
  const teamID = Number(staff.teamID);
  const regionID = Number(staff.regionID);
  const createdAt = typeof staff.createdAt === "string" ? staff.createdAt.trim() : "";
  const updatedAt = typeof staff.updatedAt === "string" ? staff.updatedAt.trim() : "";

  if (!Number.isInteger(staffID) || staffID < 1) {
    return "Staff ID must be a whole number greater than 0.";
  }

  if (!firstName) {
    return "First name is required.";
  }

  if (firstName.length > 100) {
    return "First name must be 100 characters or fewer.";
  }

  if (!lastName) {
    return "Last name is required.";
  }

  if (lastName.length > 100) {
    return "Last name must be 100 characters or fewer.";
  }

  if (phone.length > 30 && phone) {
    return "Phone number must be 30 characters or fewer.";
  }

  if (!gender) {
    return "Gender is required";
  }

  if (gender != "Female" && gender != "Male" && gender != "Non-binary" && gender != "Prefer not to say") {
    return "Gender needs to be a valid dropdown option";
  }

  if (!email) {
    return "Email is required.";
  }

  if (email.length > 255) {
    return "Email must be 255 characters or fewer.";
  }

  if (!email.includes("@")) {
    return "Email must be valid.";
  }

  if (!role) {
    return "Role is required";
  }

  if (role != "Coordinator" && role != "Trainer" && role != "Volunteer") {
    return "Role needs to be a valid dropdown option";
  }

  if (!Number.isInteger(isActive)) {
    return "Active must be a whole number";
  }

  if (!teamID) {
    return "Team required";
  }

  if (!regionID) {
    return "Region required";
  }

  if (isActive != 1 && isActive != 0) {
    return "Active must be either 1 or 0.";
  }

  return "";
}

const escapeSql = (value) => {
  return value.replace(/'/g, "''");
}
