// ===== PAGE 2 JAVASCRIPT FOR PLAYLIST BUILDER =====

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
let isTableView = false;

// DARK MODE TOGGLE
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

darkToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  applyThemeStyles();
});

// Fetch music data
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allData = data.data.spotify_top_genre_artists;
    populateGenres();
    populateCompareDropdowns();
    loadPlaylistFromStorage();
    renderFullMusicList();
    applyThemeStyles();
    setupFullListToggle();
  })
  .catch(err => console.error("API error:", err));

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

genreSelect?.addEventListener("change", () => {
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

artistSelect?.addEventListener("change", () => {
  albumSelect.innerHTML = `<option value="">--Choose Album--</option>`;
  const selectedGenre = genreSelect.value;
  const selectedArtist = artistSelect.value;
  const genreObj = allData.find(g => g.genre_name === selectedGenre);
  const artistObj = genreObj?.artists.find(a => a.name === selectedArtist);
  if (!artistObj || !artistObj.albums) return;
  const sortedAlbums = [...artistObj.albums].sort((a, b) => a.name.localeCompare(b.name));
  sortedAlbums.forEach(album => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify(album);
    opt.textContent = album.name;
    albumSelect.appendChild(opt);
  });
});

addToPlaylistBtn?.addEventListener("click", () => {
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

function populateCompareDropdowns() {
  compare1.innerHTML = `<option value="">-- Album 1 --</option>`;
  compare2.innerHTML = `<option value="">-- Album 2 --</option>`;
  const albums = [];
  allData.forEach(genre => {
    genre.artists.forEach(artist => {
      artist.albums.forEach(album => {
        albums.push({ name: album.name, album: album, image: album.cover_image });
      });
    });
  });
  const sortedAlbums = albums.sort((a, b) => a.name.localeCompare(b.name));
  sortedAlbums.forEach(({ name, album }) => {
    const option1 = document.createElement("option");
    option1.value = JSON.stringify(album);
    option1.textContent = name;
    compare1.appendChild(option1);
    const option2 = document.createElement("option");
    option2.value = JSON.stringify(album);
    option2.textContent = name;
    compare2.appendChild(option2);
  });
}

compareButton?.addEventListener("click", () => {
  if (!compare1.value || !compare2.value) return;
  const album1 = JSON.parse(compare1.value);
  const album2 = JSON.parse(compare2.value);
  compareResult.innerHTML = `
    <h3>Comparison</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: center;">
      <div>
        <p><strong>${album1.name}</strong></p>
        <p>Tracks: ${album1.total_tracks}</p>
        <p>Popularity: ${album1.popularity}</p>
        <img src="${album1.cover_image}" alt="Cover 1" style="width:150px; height:150px; object-fit:cover;">
      </div>
      <div>
        <p><strong>${album2.name}</strong></p>
        <p>Tracks: ${album2.total_tracks}</p>
        <p>Popularity: ${album2.popularity}</p>
        <img src="${album2.cover_image}" alt="Cover 2" style="width:150px; height:150px; object-fit:cover;">
      </div>
    </div>
  `;
});

searchButton?.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return;
  let results = [];
  allData.forEach(genre => {
    genre.artists.forEach(artist => {
      if (artist.name.toLowerCase().includes(query)) {
        results.push(`
          <li>
            🎤 <strong>${artist.name}</strong> (<em>${genre.genre_name}</em>)<br>
            Followers: ${artist.followers.toLocaleString()}<br>
            Popularity: ${artist.popularity}<br>
            <img src="${artist.image}" alt="Artist Image" style="width:120px; height:120px; object-fit:cover; margin:10px 0;">
          </li>
        `);
      }
      artist.albums.forEach(album => {
        if (album.name.toLowerCase().includes(query)) {
          results.push(`
            <li>
              💿 <strong>${album.name}</strong> by ${artist.name}<br>
              Popularity: ${album.popularity} | Tracks: ${album.total_tracks}<br>
              <img src="${album.cover_image}" alt="Album Cover" style="width:100px; height:100px; object-fit:cover; margin:5px 0;">
            </li>
          `);
        }
      });
    });
  });
  searchResults.innerHTML = results.length ? results.join("") : "<li>No matches found.</li>";
});

function setupFullListToggle() {
  if (fullListToggle) {
    fullListToggle.addEventListener("click", () => {
      isTableView = !isTableView;
      renderFullMusicList();
    });
  }
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
