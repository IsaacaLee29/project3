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
let allData = [];

// DARK MODE TOGGLE
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const labels = document.querySelectorAll("label, h2, h3, p");
  labels.forEach(el => {
    el.style.color = "white";
  });

  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach(el => {
    el.style.color = document.body.classList.contains("dark-mode") ? "white" : "#111";
  });

  const resultItems = document.querySelectorAll("#search-results li");
  resultItems.forEach(el => {
    el.style.color = document.body.classList.contains("dark-mode") ? "white" : "#111";
  });
});

// Fetch music data
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allData = data.data.spotify_top_genre_artists;
    populateGenres();
    populateCompareDropdowns();
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
  if (!genreObj) return;

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
  if (!artistObj) return;

  const sortedAlbums = [...artistObj.albums].sort((a, b) => a.name.localeCompare(b.name));
  sortedAlbums.forEach(album => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify(album);
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
  delBtn.addEventListener("click", () => li.remove());

  li.appendChild(delBtn);
  playlistDisplay.appendChild(li);
});

// Populate album comparison dropdowns
function populateCompareDropdowns() {
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
    const opt1 = document.createElement("option");
    opt1.value = JSON.stringify(album);
    opt1.textContent = name;
    compare1.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = JSON.stringify(album);
    opt2.textContent = name;
    compare2.appendChild(opt2);
  });
}

// Compare albums
compareButton.addEventListener("click", () => {
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

// Search music
searchButton.addEventListener("click", () => {
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
