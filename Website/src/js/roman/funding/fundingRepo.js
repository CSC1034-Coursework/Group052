/**
 * Funding Repository - Database queries for funding
 */
window.fundingRepo = {
    async loadFundingData() {
        return selectRows(
            `SELECT
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
            ORDER BY pf.startDate DESC`
        );
    },
};
