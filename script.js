// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const resultsBody = document.getElementById('resultsBody');
const themeSelect = document.getElementById('themeSelect');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumberSpan = document.getElementById('pageNumber');

let currentPage = 1;
const itemsPerPage = 5;

// Random IP Generation
function generateRandomIP() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

// Fetch Geolocation Data
async function getGeolocation(ip) {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    return response.json();
}

// Add IP to Table
function addIPToTable(ip, location) {
    const row = `
        <tr>
            <td>${ip}</td>
            <td>${location.country || 'N/A'}</td>
            <td>${location.regionName || 'N/A'}</td>
            <td>${location.city || 'N/A'}</td>
            <td>${location.isp || 'N/A'}</td>
            <td><button onclick="copyToClipboard('${ip}')">Copy</button></td>
        </tr>`;
    resultsBody.insertAdjacentHTML('beforeend', row);

    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('ipHistory')) || [];
    history.push({ ip, location });
    localStorage.setItem('ipHistory', JSON.stringify(history));

    paginateResults();
}

// Load History from localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('ipHistory')) || [];
    history.forEach(({ ip, location }) => addIPToTable(ip, location));
    paginateResults();
}

// Copy IP to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('IP Address copied to clipboard');
    });
}

// Clear History
function clearHistory() {
    localStorage.removeItem('ipHistory');
    resultsBody.innerHTML = '';
    paginateResults();
}

// Export as CSV
function exportAsCSV() {
    const history = JSON.parse(localStorage.getItem('ipHistory')) || [];
    const csvContent = history.map(({ ip, location }) => `${ip},${location.country},${location.regionName},${location.city},${location.isp}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ip_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Dark Mode Toggle
function toggleTheme(theme) {
    document.body.className = `${theme}-theme`;
}

// Search Filter
function filterResults() {
    const filter = searchInput.value.toLowerCase();
    const rows = resultsBody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName('td');
        const textContent = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
        row.style.display = textContent.includes(filter) ? '' : 'none';
    });
    paginateResults();
}

// Pagination
function paginateResults() {
    const rows = Array.from(resultsBody.getElementsByTagName('tr'));
    const totalPages = Math.ceil(rows.length / itemsPerPage);

    rows.forEach((row, index) => {
        row.style.display = index >= (currentPage - 1) * itemsPerPage && index < currentPage * itemsPerPage ? '' : 'none';
    });

    pageNumberSpan.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        paginateResults();
    }
});

nextPageBtn.addEventListener('click', () => {
    const rows = Array.from(resultsBody.getElementsByTagName('tr'));
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        paginateResults();
    }
});

// Sorting
function sortTable(column) {
    let rows = Array.from(resultsBody.getElementsByTagName('tr'));
    let sortedRows = rows.sort((a, b) => {
        const aText = a.getElementsByTagName('td')[column].textContent.toLowerCase();
        const bText = b.getElementsByTagName('td')[column].textContent.toLowerCase();
        return aText < bText ? -1 : aText > bText ? 1 : 0;
    });
    resultsBody.innerHTML = '';
    sortedRows.forEach(row => resultsBody.appendChild(row));
    paginateResults();
}

// Event Listeners
generateBtn.addEventListener('click', async () => {
    const ip = generateRandomIP();
    const location = await getGeolocation(ip);
    addIPToTable(ip, location);
});

themeSelect.addEventListener('change', (e) => {
    toggleTheme(e.target.value);
});

clearHistoryBtn.addEventListener('click', clearHistory);
exportBtn.addEventListener('click', exportAsCSV);
searchInput.addEventListener('input', filterResults);

document.querySelectorAll('th[data-sort]').forEach(header => {
    header.addEventListener('click', () => sortTable(Array.from(header.parentElement.children).indexOf(header)));
});

// On Load
window.onload = loadHistory;
