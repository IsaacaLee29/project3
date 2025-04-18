//page 2

const API_URL = "https://music.is120.ckearl.com";

// DOM Elements
const genreSelect = document.getElementById("genre-select");
const artistSelect = document.getElementById("artist-select");
const albumSelect = document.getElementById("album-select");
const playlistNameInput = document.getElementById("playlist-name");
const addToPlaylistBtn = document.getElementById("add-to-playlist");
const playlistDisplay = document.getElementById("playlist-display");

const compare1 = document.getElementById("compare-album-1");
const compare2 = document.getElementById("compare-album-2");
const compareButton = document.getElementById("compare-button");
const compareResult = document.getElementById("comparison-result");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResults = document.getElementById("search-results");

const darkToggle = document.getElementById("dark-mode-toggle");
const viewToggle = document.getElementById("view-toggle");
const fullListContainer = document.getElementById("full-music-list");
const fullListToggle = document.getElementById("view-mode-toggle");
let allData = [];

// dark mode
function applyThemeStyles() {
  const isDark = document.body.classList.contains("dark-mode");

  const labels = document.querySelectorAll("label, h2, h3, p");
  labels.forEach(el => {
    el.style.color = isDark ? "white" : "#111";
  });

  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach(el => {
    el.style.color = isDark ? "white" : "#111";
    el.style.backgroundColor = isDark ? "#102542" : "white";
    el.style.borderColor = isDark ? "#eaeaea" : "#ccc";
  });

  const resultItems = document.querySelectorAll("#search-results li");
  resultItems.forEach(el => {
    el.style.color = isDark ? "white" : "#111";
  });
}

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  applyThemeStyles();
});

// music data
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allData = data.data.spotify_top_genre_artists;
    populateGenres();
    populateCompareDropdowns();
    loadPlaylistFromStorage();
    renderFullMusicList();
    applyThemeStyles(); 
  })
  .catch(err => console.error("API error:", err));

// Populate genre dropdown
function populateGenres() {
  genreSelect.innerHTML = `<option value="">--Choose Genre--</option>`;
  const sorted = [...allData].sort((a, b) => a.genre_name.localeCompare(b.genre_name));
  sorted.forEach(genre => {
    const opt = document.createElement("option");
    opt.value = genre.genre_name;
    opt.textContent = genre.genre_name;
    genreSelect.appendChild(opt);
  });
}

// Genre → Artist dropdown
genreSelect.addEventListener("change", () => {
  artistSelect.innerHTML = `<option value="">--Choose Artist--</option>`;
  albumSelect.innerHTML = `<option value="">--Choose Album--</option>`;

  const selectedGenre = genreSelect.value;
  const genreObj = allData.find(g => g.genre_name === selectedGenre);
  if (!genreObj || !genreObj.artists) return;

  const sortedArtists = [...genreObj.artists].sort((a, b) => a.name.localeCompare(b.name));
  sortedArtists.forEach(artist => {
    const opt = document.createElement("option");
    opt.value = artist.name;
    opt.textContent = artist.name;
    artistSelect.appendChild(opt);
  });
});

// Artist → Album dropdown
artistSelect.addEventListener("change", () => {
  albumSelect.innerHTML = `<option value="">--Choose Album--</option>`;

  const selectedGenre = genreSelect.value;
  const selectedArtist = artistSelect.value;
  const genreObj = allData.find(g => g.genre_name === selectedGenre);
  const artistObj = genreObj?.artists.find(a => a.name === selectedArtist);
  if (!artistObj || !artistObj.albums) return;

  const sortedAlbums = [...artistObj.albums].sort((a, b) => a.name.localeCompare(b.name));
  sortedAlbums.forEach(album => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify({ ...album, artist: selectedArtist });
    opt.textContent = album.name;
    albumSelect.appendChild(opt);
  });
});

// Add to playlist
addToPlaylistBtn.addEventListener("click", () => {
  const albumData = albumSelect.value;
  const playlistName = playlistNameInput.value.trim();

  if (!albumData || !playlistName) return;

  const album = JSON.parse(albumData);
  const li = document.createElement("li");
  li.textContent = `${playlistName}: ${album.name}`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.style.marginLeft = "10px";
  delBtn.addEventListener("click", () => {
    li.remove();
    savePlaylistToStorage();
  });

  li.appendChild(delBtn);
  playlistDisplay.appendChild(li);
  savePlaylistToStorage();
});

function savePlaylistToStorage() {
  const items = [...playlistDisplay.querySelectorAll("li")].map(li => li.textContent.replace("❌", "").trim());
  localStorage.setItem("echoPlaylist", JSON.stringify(items));
}

function loadPlaylistFromStorage() {
  const stored = JSON.parse(localStorage.getItem("echoPlaylist")) || [];
  stored.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.addEventListener("click", () => {
      li.remove();
      savePlaylistToStorage();
    });
    li.appendChild(delBtn);
    playlistDisplay.appendChild(li);
  });
}

// Render full music list with toggle view
let isTableView = false;
if (fullListToggle) {
  fullListToggle.addEventListener("click", () => {
    isTableView = !isTableView;
    renderFullMusicList();
  });
}

function renderFullMusicList() {
  if (!fullListContainer) return;
  fullListContainer.innerHTML = "";

  const flatAlbums = [];
  allData.forEach(genre => {
    genre.artists.forEach(artist => {
      artist.albums.forEach(album => {
        flatAlbums.push({
          genre: genre.genre_name,
          artist: artist.name,
          album: album.name,
          popularity: album.popularity,
          image: album.cover_image,
          total_tracks: album.total_tracks,
          followers: artist.followers
        });
      });
    });
  });

  const topAlbums = flatAlbums.slice(0, 100);

  if (isTableView) {
    const table = document.createElement("table");
    table.style.margin = "0 auto";
    table.innerHTML = `
      <tr><th>Album</th><th>Artist</th><th>Genre</th><th>Popularity</th><th>Tracks</th><th>Followers</th></tr>
      ${topAlbums.map(a => `<tr><td>${a.album}</td><td>${a.artist}</td><td>${a.genre}</td><td>${a.popularity}</td><td>${a.total_tracks}</td><td>${a.followers.toLocaleString()}</td></tr>`).join("")}
    `;
    fullListContainer.appendChild(table);
  } else {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexWrap = "wrap";
    wrapper.style.justifyContent = "center";
    wrapper.style.gap = "1rem";

    topAlbums.forEach(a => {
      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.borderRadius = "8px";
      card.style.padding = "10px";
      card.style.textAlign = "center";
      card.style.width = "220px";
      card.innerHTML = `
        <img src="${a.image}" alt="${a.album}" style="width:100%; height:150px; object-fit:cover;">
        <h4>${a.album}</h4>
        <p><strong>${a.artist}</strong></p>
        <p><em>${a.genre}</em></p>
        <p>Popularity: ${a.popularity}</p>
        <p>Tracks: ${a.total_tracks}</p>
        <p>Followers: ${a.followers.toLocaleString()}</p>
      `;
      wrapper.appendChild(card);
    });

    fullListContainer.appendChild(wrapper);
  }
}
