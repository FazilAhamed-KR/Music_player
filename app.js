const APIController = (function () {
  const clientId = "8f23d900d5e64043a872706333e9e33c";
  const clientSecret = "121fe79a03634ab3bc4a8404edd54b91";

  // private methods
  const _getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
      },
      body: "grant_type=client_credentials",
    });

    const data = await result.json();
    return data.access_token;
  };

  const _getGenres = async (token) => {
    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.categories.items;
  };

  const _getPlaylistByGenre = async (token, genreId) => {
    const limit = 20;

    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.playlists.items;
  };

  const _getTracks = async (token, tracksEndPoint) => {
    const limit = 20;

    const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    return data.items;
  };

  const _getTrack = async (token, trackEndPoint) => {
    const result = await fetch(`${trackEndPoint}`, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    return data;
  };

  return {
    getToken() {
      return _getToken();
    },
    getGenres(token) {
      return _getGenres(token);
    },
    getPlaylistByGenre(token, genreId) {
      return _getPlaylistByGenre(token, genreId);
    },
    getTracks(token, tracksEndPoint) {
      return _getTracks(token, tracksEndPoint);
    },
    getTrack(token, trackEndPoint) {
      return _getTrack(token, trackEndPoint);
    },
  };
})();

// UI Module
const UIController = (function () {
  //object to hold references to html selectors
  const DOMElements = {
    selectGenre: "#select_genre",
    selectPlaylist: "#select_playlist",
    buttonSubmit: "#btn_submit",
    divSongDetail: "#song-detail",
    hfToken: "#hidden_token",
    divSonglist: ".song-list",
  };


  var songUrls = [
  
    // Add more song URLs here
];
  //public methods
  return {
    //method to get input fields`
    inputField() {
      return {
        genre: document.querySelector(DOMElements.selectGenre),
        playlist: document.querySelector(DOMElements.selectPlaylist),
        tracks: document.querySelector(DOMElements.divSonglist),
        submit: document.querySelector(DOMElements.buttonSubmit),
        songDetail: document.querySelector(DOMElements.divSongDetail),
      };
    },

    // need methods to create select list option
    createGenre(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectGenre)
        .insertAdjacentHTML("beforeend", html);
    },

    createPlaylist(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectPlaylist)
        .insertAdjacentHTML("beforeend", html);
    },
    

   
  
    // need method to create a track list group item
    createTrack(id, name,previewUrl) {
      //console.log(previewUrl);
      songUrls.push(previewUrl);
  
      
      const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
      document
        .querySelector(DOMElements.divSonglist)
        .insertAdjacentHTML("beforeend", html);
    },

    // need method to create the song detail
    createTrackDetail(img, title, artist, songUrl) {
      //console.log(songUrls,'fayas222');
      const detailDiv = document.querySelector(DOMElements.divSongDetail);
      // any time user clicks a new song, we need to clear out the song detail div
      detailDiv.innerHTML = "";

      const html = `
            <div class="container"> 
            <div class="row justify-content-center">
            <div class="music-player">
            <div class="album-art text-center">
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">        
            </div>
            <div class="song-info text-center">
                        <h5>${title}</h5>
                        <p>Artist Name : ${artist}</p>
                    </div>   
            <div class="iconsContainer">
            <div class="icons">
            <button id="prevButton" class="icon"><i class="bi bi-skip-backward-fill"></i></button>
            <audio id="myAudio">
            <source src="${songUrl}" type="audio/mpeg">
             </audio>
             <button id="playButton" class="icon" onclick="playAudio()"><i class="bi bi-play"></i></button>
             <button id="nextButton" class="icon"><i class="bi bi-skip-forward-fill"></i></button>
        </div>
        </div>
        </div>
         </div>
         </div> 
            </div>
            </div>`;

      detailDiv.insertAdjacentHTML("beforeend", html);

      const nextButton = document.getElementById("nextButton");
      nextButton.addEventListener("click", playNextSong,false);
      nextButton.songUrls = songUrls;
  
      const prevButton = document.getElementById("prevButton");
      prevButton.addEventListener("click", playPreviousSong);

    
    
    },

    resetTrackDetail() {
      this.inputField().songDetail.innerHTML = "";
    },

    resetTracks() {
      this.inputField().tracks.innerHTML = "";
      this.resetTrackDetail();
    },

    resetPlaylist() {
      this.inputField().playlist.innerHTML = "";
      this.resetTracks();
    },

    storeToken(value) {
      document.querySelector(DOMElements.hfToken).value = value;
    },

    getStoredToken() {
      return {
        token: document.querySelector(DOMElements.hfToken).value,
      };
    },
  };
})();



// Define the song URLs

let currentSongIndex = 0;

function playNextSong(evt) {

  let songUrls = evt.currentTarget.songUrls;
  // console.log(evt.currentTarget.songUrls,'fayas111');
    if (currentSongIndex < songUrls.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0; // Wrap around to the first song if at the end of the list
    }

    const audio = document.getElementById("myAudio");
    audio.src = songUrls[currentSongIndex];
    // audio.play(); // Auto-play the next song
};

function playPreviousSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = songUrls.length - 1; // Wrap around to the last song if at the beginning of the list
    }

    const audio = document.getElementById("myAudio");
    audio.src = songUrls[currentSongIndex];
    audio.play(); // Auto-play the previous song
}

// Add event listeners to the next and previous buttons


function playAudio() {
    const audio = document.getElementById("myAudio"); 
    const playButton = document.getElementById("playButton"); 
  
    if (audio.paused) {
      audio.play(); 
      playButton.innerHTML = '<i class="bi bi-pause"></i>'; 
    } else {
      audio.pause(); 
      playButton.innerHTML = '<i class="bi bi-play"></i>'; 
    }
  }
  

const APPController = (function (UICtrl, APICtrl) {
  // get input field object ref
  const DOMInputs = UICtrl.inputField();

  // get genres on page load
  const loadGenres = async () => {
    //get the token
    const token = await APICtrl.getToken();
    //store the token onto the page
    UICtrl.storeToken(token);
    //get the genres
    const genres = await APICtrl.getGenres(token);
    //populate our genres select element
    genres.forEach((element) => UICtrl.createGenre(element.name, element.id));
  };

  // create genre change event listener
  DOMInputs.genre.addEventListener("change", async () => {
    //reset the playlist
    UICtrl.resetPlaylist();
    //get the token that's stored on the page
    const token = UICtrl.getStoredToken().token;
    // get the genre select field
    const genreSelect = UICtrl.inputField().genre;
    // get the genre id associated with the selected genre
    const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    // ge the playlist based on a genre
    const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
    // create a playlist list item for every playlist returned
    playlist.forEach((p) => UICtrl.createPlaylist(p.name, p.tracks.href));
  });

  // create submit button click event listener
  DOMInputs.submit.addEventListener("click", async (e) => {
    // prevent page reset
    e.preventDefault();
    // clear tracks
    UICtrl.resetTracks();
    //get the token
    const token = UICtrl.getStoredToken().token;
    // get the playlist field
    const playlistSelect = UICtrl.inputField().playlist;
    // get track endpoint based on the selected playlist
    const tracksEndPoint =
      playlistSelect.options[playlistSelect.selectedIndex].value;
    // get the list of tracks
    const tracks = await APICtrl.getTracks(token, tracksEndPoint);
    // create a track list item
    //console.log(tracks,'tracks11')
    tracks.forEach((el) => UICtrl.createTrack(el.track.href, el.track.name,el.track.preview_url));
   
  
  });




  // create song selection click event listener
  DOMInputs.tracks.addEventListener("click", async (e) => {
    // prevent page reset
    e.preventDefault();
    UICtrl.resetTrackDetail();
    // get the token
    const token = UICtrl.getStoredToken().token;
    // get the track endpoint
    const trackEndpoint = e.target.id;
    //get the track object
    const track = await APICtrl.getTrack(token, trackEndpoint);
    console.log(track);
    // load the track details
    UICtrl.createTrackDetail(
      track.album.images[2].url,
      track.name,
      track.artists[0].name,
      track.preview_url
    );
  });




  return {
    init() {
      console.log("App is starting");
      loadGenres();
    },
  };
})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();
