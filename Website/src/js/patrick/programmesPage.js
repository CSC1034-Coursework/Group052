/**
 * Programmes Page State and Controller - Shared state for the programmes page
 */
window.programmesAppState = {
    refs: {
        regions: [],
        teams: [],
        statuses: [],
    },
    programmes: [],
};

/**
 * Programmes Page Controller - Main orchestrator for page initialization and event binding
 */
(() => {
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('components:loaded', init);

    async function init() {
        if (!document.querySelector('.programmes-page')) {
            return;
        }

        await bootstrap();
    }

    async function bootstrap() {
        const repo = window.programmesRepo;
        const state = window.programmesAppState;

        // Load reference data
        const [regions, teams, statuses] = await Promise.all([
            repo.loadRegions(),
            repo.loadTeams(),
            repo.loadStatuses(),
        ]);

        state.refs.regions = regions;
        state.refs.teams = teams;
        state.refs.statuses = statuses;

        // Render initial table
        await window.programmesTable.render();
    }
})();
