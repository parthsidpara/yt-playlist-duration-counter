document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const playlistNameElem = document.getElementById('playlistName');
  const totalVideosElem = document.getElementById('totalVideos');
  const durationOutputElem = document.getElementById('durationOutput');
  const closeButton = document.getElementById('closeButton');
  const calculateButton = document.getElementById('calculateButton');

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: fetchPlaylistDetails
      },
      ([{ result }]) => {
        if (result) {
          const { name, totalVideos } = result;
          playlistNameElem.textContent = `Playlist Name: ${name}`;
          totalVideosElem.textContent = `Total videos: ${totalVideos}`;
        } else {
          playlistNameElem.textContent = 'Error fetching playlist name';
          totalVideosElem.textContent = 'Error fetching total videos';
        }
      }
    );
  });

  calculateButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          function: calculatePlaylistDuration
        },
        ([{ result }]) => {
          if (result) {
            durationOutputElem.textContent = result;
          } else {
            durationOutputElem.textContent = 'Error calculating duration';
          }
        }
      );
    });
  });

  closeButton.addEventListener('click', () => {
    window.close();
  });
});

function fetchPlaylistDetails() {
  const playlistName = document.querySelector('h1#title').innerText;
  const totalVideos = document.querySelectorAll('#contents ytd-playlist-video-renderer').length;
  return { name: playlistName, totalVideos };
}

function calculatePlaylistDuration() {
  const videoDurations = Array.from(document.querySelectorAll('#contents ytd-playlist-video-renderer #text')).map(el => el.innerText);

  const totalSeconds = videoDurations.reduce((total, duration) => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return total + parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return total + parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return total;
  }, 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}