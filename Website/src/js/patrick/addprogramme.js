


// Check that a programme object contains valid values before using it in SQL.
const validateProgramme = (programme) => {
    if (!programme || typeof programme !== "object") {
        return "Programme details are required.";
    }

    // Clean up and convert values first so the checks below are easier to write.
    const name = programme.programmeName?.trim() || "";
    const regionID = Number(programme.regionID);
    const teamID = Number(programme.teamID);
    const statusID = Number(programme.statusID);
    const budget = Number(programme.budget);

    const objectives = programme.objectives?.trim() || "";
    const startDate = programme.startDate?.trim();
    const endDate = programme.endDate?.trim();

    // Check each field one at a time and return the first message that applies.
    if (!name) {
        return "You must enter a programme name.";
    }
    if (name.length > 200) {
        return "Programme name must be under 200 characters.";
    }
    if (!Number.isInteger(regionID) || regionID < 1) {
        return "Please select a region.";
    }
    if (!Number.isInteger(teamID) || teamID < 1) {
        return "Please select a team.";
    }
    if (!Number.isInteger(statusID) || statusID < 1) {
        return "Please select a status.";
    }
    if (budget && budget < 0) {
        return "Budget must be 0 or greater.";
    }


    if (!objectives) {
        return "You must enter an objective.";
    }
    if (objectives.length > 200) {
        return "Objective must be under 200 characters.";
    }
    if (!startDate) {
        return "A start date is required.";
    }
    if (endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start)
            return "The end date must be after start date or empty.";
    }

    // An empty string means every check passed.
    return "";
}


// Replace single quotes with two single quotes so they are safer inside SQL strings.
// /'/g means "find every single quote in the text" (g = global, so not just the first one).
const escapeSql = (value) => {
    return value.replace(/'/g, "''");
}