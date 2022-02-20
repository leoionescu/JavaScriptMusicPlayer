'use strict';

const songs = [
    {
      "name": "Risin' High (feat Raashan Ahmad)",
      "artist": "Ancient Astronauts",
      "album": "We Are to Answer",
      "url": "https://521dimensions.com/song/Ancient Astronauts - Risin' High (feat Raashan Ahmad).mp3",
      "cover_art_url": "https://521dimensions.com/img/open-source/amplitudejs/album-art/we-are-to-answer.jpg",
      "visualization": "michaelbromley_visualization"
    },
    {
      "name": "The Gun",
      "artist": "Lorn",
      "album": "Ask The Dust",
      "url": "https://521dimensions.com/song/08 The Gun.mp3",
      "cover_art_url": "https://521dimensions.com/img/open-source/amplitudejs/album-art/ask-the-dust.jpg",
      "visualization": "michaelbromley_visualization"
    },
    {
      "name": "Anvil",
      "artist": "Lorn",
      "album": "Anvil",
      "url": "https://521dimensions.com/song/LORN - ANVIL.mp3",
      "cover_art_url": "https://521dimensions.com/img/open-source/amplitudejs/album-art/anvil.jpg",
      "visualization": "michaelbromley_visualization"
    },
    {
      "name": "I Came Running",
      "artist": "Ancient Astronauts",
      "album": "We Are to Answer",
      "url": "https://521dimensions.com/song/ICameRunning-AncientAstronauts.mp3",
      "cover_art_url": "https://521dimensions.com/img/open-source/amplitudejs/album-art/we-are-to-answer.jpg",
      "visualization": "michaelbromley_visualization"
    },
]

function addSongsToPlaylist() {
    songs.forEach((song) => {
        const li = document.createElement('li')
        li.innerHTML = song.name + ' - ' + song.artist
        li.setAttribute('data-url', song.url)
        li.setAttribute('cover_url', song.cover_art_url)
        li.classList.add('list-group-item')
        document.getElementById('playlist').appendChild(li)
    })
    console.log('added songs to playlist')
}

const app = {
    audio: null,
    tracks: [], //track list
    currentUrl: null,
    //UI
    currentTime: null,
    duration: null,
    btnPlayPause: null,
    scrubber: null,
    volume: null
};

/** Plays a song 
 * @param {string} url - The url of the song 
 */
app.play = function (url) {
    const elements = document.querySelectorAll('#playlist li.active');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
    }

    const selectedElement = document.querySelector('#playlist li[data-url="' + url + '"]');
    selectedElement.classList.add('active');

    app.currentUrl = url;
    app.audio.src = app.currentUrl;
    app.audio.load();
    app.audio.play();

    let coverUrl = selectedElement.getAttribute('cover_url')
    if (coverUrl == null || !coverUrl) {
        coverUrl = 'media/noCover.jpg'
    } else if (coverUrl.length == 0 || coverUrl === 'undefined') {
        coverUrl = 'media/noCover.jpg'
    }
    document.getElementById('coverImage').setAttribute('src', coverUrl);
}

/** Changes the current song */
app.next = function () {
    let index = app.tracks.indexOf(app.currentUrl) + 1;
    if (index >= app.tracks.length) {
        index = 0;
    }

    app.play(app.tracks[index]);
}

app.previous = function () {
    let index = app.tracks.indexOf(app.currentUrl) - 1;
    if (index < 0) {
        index = app.tracks.length - 1;
    }

    app.play(app.tracks[index]);
}

app.shuffle = function () {
    let index = Math.floor(Math.random() * app.tracks.length);
    console.log('index: ', index);
    app.play(app.tracks[index]);
}

app.load = function () {
    app.audio = document.getElementById('audio');
    app.currentTime = document.querySelector('#currentTime');
    app.duration = document.querySelector('#duration');
    app.btnPlayPause = document.getElementById('btnPlayPause');

    // Iterate over the playlist in order to associate events

    addSongsToPlaylist()
    const elements = document.querySelectorAll('#playlist li');
    for (let i = 0; i < elements.length; i++) {

        const url = elements[i].dataset.url;
        app.tracks.push(url);

        elements[i].addEventListener('click', function () {
            app.play(this.dataset.url);
        });
    }

    // Handle the timeupdate event
    app.audio.addEventListener('durationchange', function(){
        app.duration.textContent = app.secondsToString(app.audio.duration);
    });

    app.audio.addEventListener('timeupdate', function () {
        const currentTime = app.audio.currentTime;

        if (app.audio.duration) {
            app.currentTime.textContent = app.secondsToString(currentTime);
            app.scrubber.setValue(Math.round(currentTime * 100 / app.audio.duration))
        } else {
            //innerText can also be used
            //differences https://www.w3schools.com/jsref/prop_html_innerhtml.asp
            app.currentTime.textContent = '...';
        };

        localStorage.setItem('selectedUrl', app.currentUrl)
        localStorage.setItem('time', app.audio.currentTime)
        localStorage.setItem('volume', app.audio.volume)
    });

    // Handle the play event
    app.audio.addEventListener('play', function () {
        //alternative: app.btnPlayPause.children[0].classList.replace('fa-play', 'fa-pause');
        app.btnPlayPause.children[0].classList.remove('fa-play');
        app.btnPlayPause.children[0].classList.add('fa-pause');
    });

    // Handle the pause event
    app.audio.addEventListener('pause', function () {
        app.btnPlayPause.children[0].classList.add('fa-play');
        app.btnPlayPause.children[0].classList.remove('fa-pause');
    });

    // Handle the ended event
    app.audio.addEventListener('ended', app.next);

    // Handle the click event btnPlayPause
    document.getElementById('btnPlayPause').addEventListener('click', function () {
        if (app.audio.src === "") {
            app.play(app.tracks[0]);
        } else {
            if (app.audio.paused) {
                app.audio.play();
            }
            else {
                app.audio.pause();
            }
        }
    });

    // Handle the click event on btnForward
    document.getElementById('btnForward').addEventListener('click', function () {
        app.audio.currentTime += 10;
    });

    // Handle the click event on btnNext
    document.getElementById('btnNext').addEventListener('click', app.next);

    document.getElementById('btnPrevious').addEventListener('click', app.previous);

    document.getElementById('btnShuffle').addEventListener('click', app.shuffle);

    // Add scrubber
    this.scrubber = new Slider('#scrubber', {
        formatter: value => {
            if (value) {
                let time = app.audio.duration * value / 100;
                if (time - app.audio.currentTime > 2 || time - app.audio.currentTime < -2) {
                    console.log('setting currentTime: ' + time)
                    app.audio.currentTime = time;
                }
            }
        }
    });

    // Add volume
    this.volume = new Slider('#volume', {
        formatter: value => {
            // console.log("value 2: " + value)
            app.audio.volume = (10 - value) / 10;
            return app.audio.volume * 10;
        }
    });

    let selectedUrl = localStorage.getItem('selectedUrl')
    let time = localStorage.getItem('time')
    // let volume = localStorage.getItem('volume')
    app.play(selectedUrl)
    app.audio.muted = false
    app.audio.currentTime = time

    app.audio.addEventListener('canplaythrough', e => {
        drawCanvas()
    })
};

/**
* A utility function for converting a time in miliseconds to a readable time of minutes and seconds.
* @param {number} seconds The time in seconds.
* @return {string} The time in minutes and/or seconds.
**/
app.secondsToString = function (seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);

    min = min >= 10 ? min : '0' + min;
    sec = sec >= 10 ? sec : '0' + sec;
    
    const time = min + ':' + sec;

    return time;
};


const drawCanvas = () => {
    console.log('drawing canvas')
    let canvas = document.getElementById('canvas');
    const soundAnalyser = new SoundAnalyser(canvas);
    if (app.audio.src) {
        soundAnalyser.setStreamSource(app.audio.captureStream());
        soundAnalyser.display("sinewave")
    }
          
}

