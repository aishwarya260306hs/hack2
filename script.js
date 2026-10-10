// Database of organizations mapped to streams including requested colleges & companies
const organizations = {
    education: [
        "REVA University",
        "Horizon College",
        "Global Academy of Technology",
        "PES University",
        "RV College of Engineering",
        "BMS College of Engineering",
        "MS Ramaiah Institute of Technology",
        "Christ University",
        "Bangalore University"
    ],
    tech: [
        "Infosys",
        "Wipro",
        "Tata Consultancy Services (TCS)",
        "Accenture",
        "Cognizant",
        "IBM India",
        "Microsoft India",
        "Amazon Development Center"
    ],
    government: [
        "BBMP (Bruhat Bengaluru Mahanagara Palike)",
        "BESCOM (Bangalore Electricity Supply Company)",
        "BWSSB (Water Supply and Sewerage Board)",
        "RTO (Regional Transport Office)",
        "Bangalore Police Department"
    ]
};

// User dashboard statistics tracking
let userStats = {
    posted: 0,
    resolved: 1,
    ongoing: 0
};

// Submitted data organized by organization
const submittedData = {};

function updateOrganizations() {
    const streamSelect = document.getElementById('streamSelect').value;
    const orgSelect = document.getElementById('orgSelect');
    
    orgSelect.innerHTML = '<option value="" disabled selected>-- Choose an Organization --</option>';

    if (organizations[streamSelect]) {
        organizations[streamSelect].forEach(org => {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            orgSelect.appendChild(option);
        });
    }
}

document.getElementById('problemForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const org = document.getElementById('orgSelect').value;
    const problem = document.getElementById('problemInput').value.trim();

    if (!submittedData[org]) {
        submittedData[org] = [];
    }

    // AI Semantic Category Grouping Simulator
    let category = "General Inquiries & Feedback";
    const lower = problem.toLowerCase();
    
    if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('toilet') || lower.includes('drinking')) {
        category = "💧 Water & Sanitation Issues";
    } else if (lower.includes('traffic') || lower.includes('road') || lower.includes('pothole') || lower.includes('signal') || lower.includes('street')) {
        category = "🚦 Traffic & Roadway Issues";
    } else if (lower.includes('login') || lower.includes('portal') || lower.includes('server') || lower.includes('error') || lower.includes('wifi') || lower.includes('net')) {
        category = "💻 IT, Portal & Network Issues";
    } else if (lower.includes('fee') || lower.includes('payment') || lower.includes('bill') || lower.includes('salary') || lower.includes('payroll')) {
        category = "💳 Billing, Fee & Payroll Related";
    }

    submittedData[org].push({ text: problem, category: category });

    // Update Dashboard metrics
    userStats.posted++;
    userStats.ongoing = userStats.posted - userStats.resolved;
    updateDashboardUI();

    // Clear textarea
    document.getElementById('problemInput').value = '';

    // Render grouped layout
    renderClusters(org);
});

function renderClusters(org) {
    const resultsSection = document.getElementById('resultsSection');
    const clustersContainer = document.getElementById('clustersContainer');
    
    resultsSection.style.display = 'block';
    clustersContainer.innerHTML = '';

    const problems = submittedData[org];

    // Group by category headings
    const grouped = {};
    problems.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item.text);
    });

    for (const [catTitle, items] of Object.entries(grouped)) {
        const card = document.createElement('div');
        card.className = 'cluster-card';
        
        card.innerHTML = `
            <div class="cluster-title">${catTitle}</div>
            <ul>
                ${items.map(p => `<li class="problem-item">${escapeHtml(p)}</li>`).join('')}
            </ul>
        `;
        clustersContainer.appendChild(card);
    }
}

function toggleDashboard() {
    const modal = document.getElementById('dashboardModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function updateDashboardUI() {
    document.getElementById('totalPosted').textContent = userStats.posted;
    document.getElementById('totalResolved').textContent = userStats.resolved;
    document.getElementById('totalOngoing').textContent = userStats.ongoing > 0 ? userStats.ongoing : 0;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}