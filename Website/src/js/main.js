let navBound = false;

function initNavigation() {
  if (navBound) {
    return;
  }

  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('navLinks');

  if (!burger || !nav) {
    return;
  }

  navBound = true;

  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    }
  });
}

async function initHomeStats() {
	const root = document.querySelector('.hero__visual');
	if (!root) return;

	const cards = root.querySelectorAll('.hero__card-value');
	if (cards.length < 3) return;

	const setNA = () => cards.forEach(c => c.textContent = 'N/A');

	try {
		const [completionRows, activeRows, improvementRows] = await Promise.all([
			selectRows("SELECT ROUND(100.0 * SUM(CASE WHEN completionStatus = 'Completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS completion_rate FROM tblEnrolment"),
			selectRows("SELECT COUNT(DISTINCT beneficiaryID) AS active_participants FROM tblEnrolment WHERE completionStatus = 'Enrolled'"),
			selectRows("SELECT ROUND(AVG(CAST(postAssessmentScore AS SIGNED) - CAST(preAssessmentScore AS SIGNED)), 1) AS avg_improvement FROM tblEnrolment WHERE preAssessmentScore IS NOT NULL AND postAssessmentScore IS NOT NULL")
		]);

		const completion = completionRows[0]?.completion_rate;
		const active = activeRows[0]?.active_participants;
		const improvement = improvementRows[0]?.avg_improvement;

		cards[0].textContent = completion ?? 'N/A';
		if (completion !== null && completion !== undefined) {
			cards[0].textContent = `${completion}%`;
		}

		cards[1].textContent = active ?? 'N/A';

		cards[2].textContent = improvement ?? 'N/A';
		if (improvement !== null && improvement !== undefined) {
			cards[2].textContent = `+${improvement} pts`;
		}

	} catch (e) {
        console.error('HomeStats error:', e);
		setNA();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	initNavigation();
	initHomeStats();
});

document.addEventListener('components:loaded', initNavigation);