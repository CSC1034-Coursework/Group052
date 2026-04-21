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

    // Clean up and convert values first so the checks below are easier to write.
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


    /*
    if (!Number.isInteger(studentID) || studentID < 1) {
      return "Student ID must be a whole number greater than 0.";
    }
  
    if (!firstName) {
      return "First name is required.";
    }
  
    if (firstName.length > 50) {
      return "First name must be 50 characters or fewer.";
    }
  
    if (!lastName) {
      return "Last name is required.";
    }
  
    if (lastName.length > 50) {
      return "Last name must be 50 characters or fewer.";
    }
  
    if (!course) {
      return "Course is required.";
    }
  
    if (course.length > 50) {
      return "Course must be 50 characters or fewer.";
    }
  
    if (!Number.isInteger(mark) || mark < 0 || mark > 100) {
      return "Mark must be a whole number between 0 and 100.";
    }
      No validation rn, just want to get it working first
      */

    return "";
}

// Replace single quotes with two single quotes so they are safer inside SQL strings.
// /'/g means "find every single quote in the text" (g = global, so not just the first one).
const escapeSql = (value) => {
    return value.replace(/'/g, "''");
}
