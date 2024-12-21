async function fetchGitHubData() {
    const username = document.getElementById('username').value;

    // Clear any previous data from the profile and repositories sections
    const profileElement = document.getElementById('profile');
    const reposElement = document.getElementById('repos');
    profileElement.innerHTML = '';
    reposElement.innerHTML = '';

    try {
        // Fetch user profile data from the GitHub API
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        if (!userResponse.ok) {
            throw new Error('User not found'); // Handle invalid usernames
        }
        const userData = await userResponse.json();

        // Fetch user repositories data from the GitHub API
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const repoData = await repoResponse.json();

        // Display the user profile information
        profileElement.innerHTML = `
          <h2>${userData.name || 'Name not provided'}</h2>
          <p><strong>Username:</strong> ${userData.login}</p>
          <p><strong>Followers:</strong> ${userData.followers}</p>
          <p><strong>Following:</strong> ${userData.following}</p>
          <p><strong>Public Repositories:</strong> ${userData.public_repos}</p>
        `;

        // Display the user's repositories
        reposElement.innerHTML = '<h2>Repositories</h2>';
        repoData.forEach(repo => {
            reposElement.innerHTML += `
              <div>
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'No description provided'}</p>
                <p>Language: ${repo.language || 'Not specified'}</p>
                <p>Stars: ${repo.stargazers_count}</p>
              </div>
            `;
        });
    } catch (error) {
        // Display an error message if something goes wrong
        profileElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}
