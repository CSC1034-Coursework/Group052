/**
 * Funding Repository - Database queries for funding
 */
window.fundingRepo = {
    async loadFundingData(programmeID, sourceType) {
        let sql = `SELECT
                pf.programmeID,
                pf.sourceID,
                pf.amount,
                pf.startDate,
                pf.endDate,
                p.programmeName,
                fs.sourceName,
                fs.sourceType
            FROM tblProgrammeFunding pf
            INNER JOIN tblProgramme p ON p.programmeID = pf.programmeID
            INNER JOIN tblFundingSource fs ON fs.sourceID = pf.sourceID
            WHERE 1=1`;
        
        const params = [];
        
        if (programmeID !== 'All') {
            sql += ' AND pf.programmeID = ?';
            params.push(programmeID);
        }
        
        if (sourceType !== 'All') {
            sql += ' AND fs.sourceType = ?';
            params.push(sourceType);
        }
        
        sql += ' ORDER BY pf.startDate DESC';
        
        return selectRows(sql, params);
    },

    async loadProgrammes() {
        return selectRows('SELECT programmeID, programmeName FROM tblProgramme ORDER BY programmeName');
    },
};
