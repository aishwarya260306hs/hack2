
const streamSelect = document.getElementById("streamSelect");
const orgSelect = document.getElementById("orgSelect");
const problemForm = document.getElementById("problemForm");
const problemInput = document.getElementById("problemInput");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "resolveAIProblems";

const organizations = {
    education: [
        "REVA University",
        "Other Colleges / Universities",
        "Schools"
    ],
    tech: [
        "Tech Company",
        "IT Support Department",
        "Other Tech Organizations"
    ],
    government: [
        "BBMP",
        "BESCOM",
        "Government Office"
    ]
};

let problems = loadProblems();

function loadProblems() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveProblems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

function updateOrganizations() {
    orgSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Choose an organization --";
    orgSelect.appendChild(placeholder);

    (organizations[streamSelect.value] || []).forEach(org => {
        const option = document.createElement("option");
        option.value = org;
        option.textContent = org;
        orgSelect.appendChild(option);
    });
}

streamSelect.addEventListener("change", updateOrganizations);

function getKeywords(text) {
    const stopWords = new Set([
        "the", "is", "a", "an", "and", "or", "in", "on",
        "at", "to", "of", "for", "with", "my", "our",
        "it", "this", "that", "are", "was", "be", "have",
        "has", "from", "by", "not", "very", "there",
        "been", "being", "as", "but", "after", "i", "we"
    ]);

    return new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
    );
}

function similarityScore(textA, textB) {
    const wordsA = getKeywords(textA);
    const wordsB = getKeywords(textB);

    if (!wordsA.size || !wordsB.size) return 0;

    const common = [...wordsA].filter(word => wordsB.has(word));
    const all = new Set([...wordsA, ...wordsB]);

    return common.length / all.size;
}

function findSimilar(problem) {
    return problems.filter(item =>
        item.id !== problem.id &&
        item.organization === problem.organization &&
        similarityScore(item.description, problem.description) >= 0.3
    );
}

problemForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = problemInput.value.trim();
    const organization = orgSelect.value;
    const stream = streamSelect.value;

    if (!description || !organization || !stream) return;

    const newProblem = {
        id: Date.now().toString(),
        description,
        organization,
        stream,
        date: new Date().toISOString(),
        status: "In Progress",
        response: ""
    };

    const matches = findSimilar(newProblem);

    problems.push(newProblem);
    saveProblems();

    if (matches.length > 0) {
        formMessage.textContent =
            `Found ${matches.length} potentially similar complaint(s) at ${organization}. Your complaint was submitted.`;
    } else {
        formMessage.textContent =
            "Complaint submitted! No sufficiently similar complaint was found in this browser's records.";
    }

    problemForm.reset();
    updateOrganizations();
    renderDashboard();
});

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function renderDashboard() {
    const responded = problems.filter(
        p => p.response && p.response.trim()
    );

    const resolvedCount = problems.filter(
        p => p.status === "Resolved"
    ).length;

    const progressCount = problems.filter(
        p => p.status === "In Progress"
    ).length;

    const matchedIds = new Set();

    problems.forEach(problem => {
        findSimilar(problem).forEach(match => {
            matchedIds.add(problem.id);
            matchedIds.add(match.id);
        });
    });

    document.getElementById("totalProblems").textContent =
        problems.length;

    document.getElementById("similarProblems").textContent =
        matchedIds.size;

    document.getElementById("myProblems").textContent =
        problems.length;

    document.getElementById("responsesReceived").textContent =
        responded.length;

    document.getElementById("inProgress").textContent =
        progressCount;

    document.getElementById("resolved").textContent =
        resolvedCount;

    renderClusters();
    renderMyProblems();
}

function renderClusters() {
    const container = document.getElementById("clustersContainer");
    container.replaceChildren();

    const clusters = [];

    problems.forEach(problem => {
        const matches = findSimilar(problem);

        if (matches.length === 0) return;

        const related = [problem, ...matches];
        const ids = new Set(related.map(item => item.id));

        const alreadyShown = clusters.some(cluster =>
            [...ids].some(id => cluster.ids.has(id))
        );

        if (!alreadyShown) {
            clusters.push({
                ids,
                organization: problem.organization,
                items: related
            });
        }
    });

    if (clusters.length === 0) {
        container.appendChild(makeElement(
            "p",
            "empty-state",
            "No similar problem clusters found yet. Submit related complaints to see potential matches."
        ));
        return;
    }

    clusters.forEach(cluster => {
        const card = makeElement("div", "cluster-card");

        card.appendChild(makeElement(
            "h3", "", cluster.organization
        ));

        card.appendChild(makeElement(
            "p", "", cluster.items[0].description
        ));

        card.appendChild(makeElement(
            "span",
            "cluster-count",
            `${cluster.ids.size} potentially related report(s)`
        ));

        container.appendChild(card);
    });
}

function renderMyProblems() {
    const tbody = document.getElementById("myProblemsTable");
    tbody.replaceChildren();

    if (problems.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();

        cell.colSpan = 5;
        cell.className = "empty-state";
        cell.textContent = "You haven't submitted any problems yet.";
        return;
    }

    [...problems].reverse().forEach(problem => {
        const row = tbody.insertRow();

        row.insertCell().textContent = problem.description;
        row.insertCell().textContent = problem.organization;
        row.insertCell().textContent =
            new Date(problem.date).toLocaleDateString();

        const statusClass = problem.status === "Resolved"
            ? "status status-resolved"
            : "status status-progress";

        row.insertCell().appendChild(makeElement(
            "span", statusClass, problem.status
        ));

        const responseCell = row.insertCell();

        if (problem.response && problem.response.trim()) {
            responseCell.appendChild(makeElement(
                "span", "status status-response", "Received"
            ));

            responseCell.title = problem.response;
        } else {
            responseCell.textContent = "Awaiting response";
        }
    });
}

renderDashboard();
