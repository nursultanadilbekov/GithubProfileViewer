let allRepositories = [];
let filteredRepositories = [];

async function fetchGitHubData() {
    const username = document.getElementById('username').value;
    const profileElement = document.getElementById('profile');
    const reposElement = document.getElementById('repos');
    const languageFilter = document.getElementById('languageFilter');
    profileElement.innerHTML = '';
    reposElement.innerHTML = '';

    try {
        // Fetch user profile and repository data
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userResponse.json();
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const repoData = await repoResponse.json();

        // Display user profile information
        profileElement.innerHTML = `
          <h2>${userData.name || 'Name not provided'}</h2>
          <img src="${userData.avatar_url}" alt="${userData.login}'s avatar" style="width: 150px; height: 150px; border-radius: 50%;" />
          <p><strong>Username:</strong> ${userData.login}</p>
          <p><strong>Followers:</strong> ${userData.followers}</p>
          <p><strong>Following:</strong> ${userData.following}</p>
          <p><strong>Public Repositories:</strong> ${userData.public_repos}</p>
        `;

        allRepositories = repoData;
        populateLanguageFilter(repoData);
        filteredRepositories = repoData;
        displayRepositories(filteredRepositories);
        renderLanguageChart(calculateLanguageStats(repoData));

    } catch (error) {
        profileElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

function populateLanguageFilter(repos) {
    // Collect unique languages from repositories and populate the filter dropdown
    const languageSet = new Set(repos.map(repo => repo.language).filter(Boolean));
    const languageFilter = document.getElementById('languageFilter');
    languageFilter.innerHTML = '<option value="all">All Languages</option>';
    languageSet.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
}

function filterRepositories() {
    // Filter repositories based on the selected language
    const selectedLanguage = document.getElementById('languageFilter').value;
    filteredRepositories = selectedLanguage === 'all'
        ? allRepositories
        : allRepositories.filter(repo => repo.language === selectedLanguage);
    currentPage = 1;
    displayRepositories(filteredRepositories);
}

function calculateLanguageStats(repos) {
    // Calculate the number of repositories for each language
    return repos.reduce((stats, repo) => {
        if (repo.language) stats[repo.language] = (stats[repo.language] || 0) + 1;
        return stats;
    }, {});
}

function renderLanguageChart(stats) {
    const ctx = document.getElementById('languageChart').getContext('2d');
    
    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(stats),
            datasets: [{
                data: Object.values(stats),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        }
    });
}


let currentPage = 1;
const reposPerPage = 5;

function displayRepositories(repos, page = 1) {
    // Display repositories for the current page
    const startIndex = (page - 1) * reposPerPage;
    const paginatedRepos = repos.slice(startIndex, startIndex + reposPerPage);
    const reposElement = document.getElementById('repos');
    reposElement.innerHTML = '<h2>Repositories</h2>';
    paginatedRepos.forEach(repo => {
        reposElement.innerHTML += `
          <div>
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>${repo.description || 'No description provided'}</p>
            <p>Language: ${repo.language || 'Not specified'}</p>
            <p>Stars: ${repo.stargazers_count}</p>
          </div>
        `;
    });
    displayPagination(repos, page);
}

function displayPagination(repos, currentPage) {
    // Display pagination controls
    const totalPages = Math.ceil(repos.length / reposPerPage);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationElement.innerHTML += `
          <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
            ${i}
          </button>
        `;
    }
}

function changePage(page) {
    // Change the current page and display repositories
    currentPage = page;
    displayRepositories(filteredRepositories, page);
}

document.getElementById('fetchButton').addEventListener('click', fetchGitHubData);
