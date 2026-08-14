// You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  searchInput(allEpisodes);
  setupDropdown(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

// Search
function searchInput(allEpisodes) {
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Search episodes...";
  const controls = document.createElement("div");
  controls.classList.add("controls");
  controls.append(search);
  document.body.prepend(controls);
  search.addEventListener("input", () => {
    const searchText = search.value.toLowerCase();
    const filteredEpisode = allEpisodes.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "")
        .toLowerCase()
        .replace(/<[^>]*>/g, "");
      return name.includes(searchText) || summary.includes(searchText);
    });
    makePageForEpisodes(filteredEpisode);
  });
}

// Dropdown
function setupDropdown(allEpisodes) {
  const episodeSelect = document.createElement("select");
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const code = formatEpisodeCode(episode.season, episode.number);
    option.value = episode.id;
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
  const controls = document.querySelector(".controls");
  controls.append(episodeSelect);
  episodeSelect.addEventListener("change", () => {
    const value = episodeSelect.value;
    if (value === "all") {
      makePageForEpisodes(allEpisodes);
      return;
    }
    const selected = allEpisodes.find((episode) => episode.id == value);
    if (selected) {
      makePageForEpisodes([selected]);
    }
  });
}

// Format episode code
function formatEpisodeCode(season, episode) {
  const seasonString = String(season).padStart(2, "0");
  const episodeString = String(episode).padStart(2, "0");
  return `S${seasonString}E${episodeString}`;
}

// Create one episode card
function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(
    episode.season,
    episode.number,
  )}`;

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = `${episode.name} episode image`;
  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = episode.summary;
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
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const heading = document.createElement("h1");
  heading.textContent = "Game of Thrones Episodes";
  rootElem.appendChild(heading);
  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} / ${getAllEpisodes().length} episodes`;
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
