
//play a song
function playSong() {
    const audio = document.getElementById("music-player");
    audio.play();
  }
  
//api
const API_URL = "https://music.is120.ckearl.com";
//genre
function getGenreFont(genre) {
    const fontMap = {
        pop: "'Pacifico', cursive",
        rock: "'Roboto Slab', serif",
        rap: "'Anton', sans-serif",
        country: "'Cinzel', serif",
        dance: "'Dancing Script', cursive"
    };
    return fontMap[genre] || "'Montserrat', sans-serif";
}

function getGenreBorder(genre) {
    const borderMap = {
        pop: "3px solid pink",
        rock: "3px solid gray",
        rap: "3px solid purple",
        country: "3px solid saddlebrown",
        dance: "3px solid cyan"
    };
    return borderMap[genre] || "2px solid white";
}
//carousel
function populateCarousel(data) {
    const carousel = document.querySelector(".carousel");
    let allCards = [];

    data.forEach(genre => {
        genre.artists.slice(0, 2).forEach(artist => {
            const card = document.createElement("div");
            card.classList.add("carousel-card");

            card.innerHTML = `
                <img src="${artist.image}" alt="${artist.name}" class="card-img">
                <p style="font-family: ${getGenreFont(genre.genre_name)};">${artist.name}</p>
            `;

            carousel.appendChild(card);
            allCards.push(card);
        });
    });

    // carousel movement
    let currentIndex = 0;
    const cardWidth = 250;
    const margin = 30;

    function moveCarousel(direction) {
        const totalCards = allCards.length;
        if (direction === 'left') {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        } else {
            currentIndex = (currentIndex + 1) % totalCards;
        }
        carousel.style.transition = 'transform 0.5s ease';
        carousel.style.transform = `translateX(-${(currentIndex) * (cardWidth + margin)}px)`;
    }

    document.querySelector('.arrow-left').addEventListener('click', () => moveCarousel('left'));
    document.querySelector('.arrow-right').addEventListener('click', () => moveCarousel('right'));
}

//album covers
function populateScrollingCovers(data) {
    const topRow = document.querySelector(".album-covers");
    const bottomRow = document.querySelector(".album-covers.second-row");
  
    let allAlbums = [];
  
    data.forEach(genre => {
      genre.artists.forEach(artist => {
        artist.albums.forEach(album => {
          allAlbums.push({
            image: album.cover_image,
            name: album.name,
            genre: genre.genre_name
          });
        });
      });
    });
  
    const shuffled = allAlbums.sort(() => Math.random() - 0.5);
    const topAlbums = shuffled.slice(0, 40);
    const bottomAlbums = shuffled.slice(40, 80);
  
    topAlbums.forEach(album => {
      const img = document.createElement("img");
      img.src = album.image;
      img.alt = album.name;
      img.className = "cover";
      img.style.border = getGenreBorder(album.genre);
      topRow.appendChild(img);
    });
  
    bottomAlbums.forEach(album => {
      const img = document.createElement("img");
      img.src = album.image;
      img.alt = album.name;
      img.className = "cover";
      img.style.border = getGenreBorder(album.genre);
      bottomRow.appendChild(img);
    });
  }
  


fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log("Correct Array:", data.data.spotify_top_genre_artists); 

    const spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.style.display = "none";

    populateCarousel(data.data.spotify_top_genre_artists);
    populateScrollingCovers(data.data.spotify_top_genre_artists);
  })
  .catch(error => {
    console.error("API fetch failed:", error);
  });




  const moodMap = {
    hype: ["dance", "electronic", "metal", "rock", "latin"],
    chill: ["r&b", "folk", "indie"],
    sad: ["folk", "r&b", "indie"],
    happy: ["pop", "latin", "dance", "indie"]
  };
  
  //getting stuff
  document.getElementById("get-song").addEventListener("click", () => {
    const mood = document.getElementById("mood-select").value;
    const loading = document.getElementById("song-loading");
    const display = document.getElementById("song-display");
  
    if (!mood) {
      alert("Please select a mood!");
      return;
    }
  
    loading.classList.remove("hidden");
    display.classList.add("hidden");
  
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const genres = data.data.spotify_top_genre_artists;
  
        const validGenres = genres.filter(genre =>
          moodMap[mood].includes(genre.genre_name.toLowerCase())
        );
  
        if (validGenres.length === 0) {
          loading.classList.add("hidden");
          alert("No songs found for that mood!");
          return;
        }
  
        const randomGenre = validGenres[Math.floor(Math.random() * validGenres.length)];
        const randomArtist = randomGenre.artists[Math.floor(Math.random() * randomGenre.artists.length)];
        const randomAlbum = randomArtist.albums[Math.floor(Math.random() * randomArtist.albums.length)];
        const randomSong = randomAlbum.songs[Math.floor(Math.random() * randomAlbum.songs.length)];
  
        document.getElementById("song-image").src = randomAlbum.cover_image;
        document.getElementById("song-title").innerText = randomSong.name;
        document.getElementById("song-artist").innerText = `by ${randomArtist.name}`;
        document.getElementById("song-popularity").innerText = `Popularity: ${randomArtist.popularity}`;
        document.getElementById("song-followers").innerText = `Followers: ${randomArtist.followers.toLocaleString()}`;
        document.getElementById("song-tracks").innerText = `Tracks on Album: ${randomAlbum.total_tracks}`;
        
  
        loading.classList.add("hidden");
        display.classList.remove("hidden");
      })
      .catch(err => {
        loading.classList.add("hidden");
        alert("Could not load song of the day.");
        console.error(err);
      });
  });
  
// Floating notes animation
const noteTypes = ["🎵", "🎶", "🎼", "🎧", "🎤"];
const noteContainer = document.querySelector(".note-background");

function spawnNote() {
  const note = document.createElement("span");
  note.className = "note";
  note.innerText = noteTypes[Math.floor(Math.random() * noteTypes.length)];

  // Random horizontal position and size
  note.style.left = `${Math.random() * 100}%`;
  note.style.fontSize = `${Math.random() * 1.5 + 1}rem`;

  noteContainer.appendChild(note);

  // Remove after animation ends
  setTimeout(() => note.remove(), 4000);
}

// Create a new note every 400ms
setInterval(spawnNote, 400);

  

