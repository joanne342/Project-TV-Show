let allShows = [];
let allEpisodes = [];
let episodeCache = {};
async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p class='loading'>Loading shows, please wait...</p>";
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Server returned status code ${response.status}`);
    }
    allShows = await response.json();
    // Sort shows alphabetically, ignoring case
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
    setupShowDropdown();
    // Display the first show when the page loads
    if (allShows.length > 0) {
      await loadShow(allShows[0]);
    }
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-message">
        <h2>Failed to load shows</h2>
        <p>Something went wrong while fetching the shows.</p>
        <p><em>Details: ${error.message}</em></p>
      </div>
    `;
  }
}
// Show dropdown
function setupShowDropdown() {
  const controls = getControls();
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
  controls.prepend(showSelect);
  showSelect.addEventListener("change", async () => {
    const selectedShow = allShows.find(
      (show) => show.id === Number(showSelect.value),
    );
    if (selectedShow) {
      await loadShow(selectedShow);
    }
  });
}
// Load episodes for selected show
async function loadShow(show) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p class="loading">Loading ${show.name} episodes...</p>`;
  try {
    // Check whether we already fetched this show's episodes
    if (!episodeCache[show.id]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${show.id}/episodes`,
      );
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      episodeCache[show.id] = await response.json();
    }
    // Use the cached episodes
    allEpisodes = episodeCache[show.id];
    setupEpisodeControls();
    makePageForEpisodes(allEpisodes, show.name);
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-message">
        <h2>Failed to load episodes</h2>
        <p>Something went wrong while fetching the episodes.</p>
        <p><em>Details: ${error.message}</em></p>
      </div>
    `;
  }
}
// Get or create controls container
function getControls() {
  let controls = document.querySelector(".controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "controls";
    document.body.prepend(controls);
  }
  return controls;
}
// Set up search and episode dropdown
function setupEpisodeControls() {
  const controls = getControls();
  // Remove old episode controls
  const oldSearch = document.getElementById("search-input");
  const oldEpisodeSelect = document.getElementById("episode-select");
  if (oldSearch) {
    oldSearch.remove();
  }
  if (oldEpisodeSelect) {
    oldEpisodeSelect.remove();
  }
  // Search input
  const search = document.createElement("input");
  search.id = "search-input";
  search.type = "text";
  search.placeholder = "Search episodes...";
  controls.appendChild(search);
  // Episode dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
  controls.appendChild(episodeSelect);
  // Search
  search.addEventListener("input", () => {
    const searchText = search.value.toLowerCase().trim();
    // Reset episode dropdown
    episodeSelect.value = "all";
    const filteredEpisodes = allEpisodes.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "")
        .replace(/<[^>]*>/g, "")
        .toLowerCase();
      return name.includes(searchText) || summary.includes(searchText);
    });
    makePageForEpisodes(filteredEpisodes, getSelectedShowName());
  });

  // Episode dropdown
  episodeSelect.addEventListener("change", () => {
    const value = episodeSelect.value;
    // Clear search for Episodes
    search.value = "";
    if (value === "all") {
      makePageForEpisodes(allEpisodes, getSelectedShowName());
      return;
    }
    const selectedEpisode = allEpisodes.find(
      (episode) => episode.id === Number(value),
    );
    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode], getSelectedShowName());
    }
  });
}

// Get selected show name
function getSelectedShowName() {
  const showSelect = document.getElementById("show-select");
  if (!showSelect) {
    return "";
  }
  const selectedShow = allShows.find(
    (show) => show.id === Number(showSelect.value),
  );
  return selectedShow ? selectedShow.name : "";
}

// Format episode code
function formatEpisodeCode(season, episode) {
  const seasonString = String(season).padStart(2, "0");
  const episodeString = String(episode).padStart(2, "0");
  return `S${seasonString}E${episodeString}`;
}

// Create episode card
function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";
  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(
    episode.season,
    episode.number,
  )}`;
  const image = document.createElement("img");
  image.src = episode.image?.medium || "";
  image.alt = `${episode.name} episode image`;
  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = episode.summary || "";
  const link = document.createElement("a");

  link.href = episode.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View on TVMaze";

  card.appendChild(title);
  card.appendChild(image);
  card.appendChild(summary);
  card.appendChild(link);

  return card;
}

// Display episodes
function makePageForEpisodes(episodeList, showName) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const heading = document.createElement("h1");
  heading.textContent = `${showName} Episodes`;
  rootElem.appendChild(heading);
  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;
  rootElem.appendChild(count);
  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);
  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";
  rootElem.appendChild(episodesContainer);
  const cards = episodeList.map(createEpisodeCard);
  episodesContainer.append(...cards);
}

window.onload = setup;
