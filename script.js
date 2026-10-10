// Database of organizations mapped to streams
const organizations = {
    education: [
        "REVA University",
        "Horizon College",
        "Global Academy of Technology",
        "PES University",
        "RV College of Engineering"
    ],
    tech: [
        "Infosys",
        "Wipro",
        "Tata Consultancy Services (TCS)",
        "Accenture",
        "Cognizant"
    ],
    government: [
        "BBMP (Bangalore Bruhot Mahanagara Palike)",
        "BESCOM (Electricity Board)",
        "Bangalore Water Supply and Sewerage Board (BWSSB)",
        "Regional Transport Office (RTO)"
    ]
};

// Mock database holding submitted problems to simulate AI clustering
const submittedData = {};

function updateOrganizations() {
    const streamSelect = document.getElementById('streamSelect').value;
    const orgSelect = document.getElementById('orgSelect');
    
    // Clear current options
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

    // Push problem (In production, send 'problem' to your backend LLM API for embedding/clustering)
    submittedData[org].push(problem);

    // Clear textarea
    document.getElementById('problemInput').value = '';

    // Render clustered results
    renderClusters(org);
});

function renderClusters(org) {
    const resultsSection = document.getElementById('resultsSection');
    const clustersContainer = document.getElementById('clustersContainer');
    
    resultsSection.style.display = 'block';
    clustersContainer.innerHTML = '';

    const problems = submittedData[org];
    
    const card = document.createElement('div');
    card.className = 'cluster-card';
    
    card.innerHTML = `
        <div class="cluster-title">Institution: ${org}</div>
        <ul>
            ${problems.map(p => `<li class="problem-item">${escapeHtml(p)}</li>`).join('')}
        </ul>
    `;
    clustersContainer.appendChild(card);
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