// Organization data catalog mapped to streams
const organizationData = {
    education: [
        "REVA University",
        "PES University",
        "MS Ramaiah Institute of Technology",
        "BMS College of Engineering",
        "Bangalore University",
        "Christ University"
    ],
    tech: [
        "Google India (Bangalore)",
        "Microsoft IDC",
        "Amazon Development Centre",
        "Infosys Electronic City",
        "Wipro Technologies",
        "Accenture"
    ],
    gov: [
        "Bruhat Bengaluru Mahanagara Palike (BBMP)",
        "Bangalore Water Supply and Sewerage Board (BWSSB)",
        "Bescom (Electricity Board)",
        "Bangalore Traffic Police",
        "Regional Transport Office (RTO)"
    ],
    healthcare: [
        "Manipal Hospital, Old Airport Road",
        "Apollo Hospitals, Bannerghatta Road",
        "Narayana Health City",
        "Fortis Hospital, Cunningham Road",
        "Bowring and Lady Curzon Hospital"
    ]
};

function updateOrganizations() {
    const streamSelect = document.getElementById('streamSelect');
    const orgSelect = document.getElementById('orgSelect');
    const selectedStream = streamSelect.value;

    // Clear previous options
    orgSelect.innerHTML = '<option value="" disabled selected>-- Select Organization --</option>';

    if (selectedStream && organizationData[selectedStream]) {
        organizationData[selectedStream].forEach(org => {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            orgSelect.appendChild(option);
        });
    }
}

function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload
    
    // Switch view from form to success confirmation card
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('success-view').style.display = 'block';
}

function resetForm() {
    // Clear form inputs
    document.getElementById('complaintForm').reset();
    document.getElementById('orgSelect').innerHTML = '<option value="" disabled selected>-- First select a stream --</option>';
    
    // Switch back to form view
    document.getElementById('success-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
}