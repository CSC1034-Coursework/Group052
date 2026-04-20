/**
 * Programmes Repository - Database queries for programmes
 */
window.programmesRepo = {
    async loadProgrammesData() {
        return selectRows(
            `SELECT programmeID, programmeName, regionID, teamID, startDate, endDate, budget, objectives, statusID, focusArea 
            FROM tblProgramme 
            ORDER BY programmeID`
        );
    },

    async loadRegions() {
        return selectRows('SELECT regionID, regionName FROM tblRegion');
    },

    async loadTeams() {
        return selectRows('SELECT teamID, teamName FROM tblTeam');
    },

    async loadStatuses() {
        return selectRows('SELECT statusID, statusName FROM tblProgrammeStatus');
    },
};
