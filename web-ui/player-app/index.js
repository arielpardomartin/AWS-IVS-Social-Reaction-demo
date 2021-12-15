import { config } from './config.js';
import { createSocket, setOnMessageListener } from './websocket.js';

// Configuration
const channelArn = getParameterByName('channelArn') || config.CHANNELS[0].arn;
const playbackUrl = getParameterByName('playbackUrl') || config.CHANNELS[0].playbackUrl;
const endpoints = config.ENDPOINT_METADATA;
const webSocketURL = config.WS_SOCIAL_REACTIONS_URL;

// App
const videoPlayer = document.getElementById('video-player');
const emojiContainer = document.querySelector('.overlay');
const clientId = parseInt(Math.random().toString().slice(2)).toString(16).slice(0, 8);
const ICON_REMOVE_TIME = 2000;
const ICON_FADE_START_TIME = 1000;
const iconTypeMap = {
  star: '🌟',
  100: '💯',
  clap: '👏',
  tada: '🎉',
  laugh: '😂',
};
let selectedEmoji = 'clap';

main();

(function (IVSPlayer) {
  const PlayerEventType = IVSPlayer.PlayerEventType;

  // Initialize player
  const player = IVSPlayer.create();
  player.attachHTMLVideoElement(videoPlayer);

  player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, handleMetadata);

  // Setup stream and play
  player.setAutoplay(true);
  player.load(playbackUrl);
  player.setVolume(0);
})(window.IVSPlayer);

function handleMetadata(metadata) {
  const jsonText = metadata.text;
  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    console.error(`Failed to parse json error: ${e} input: ${jsonText}`);
    return;
  }

  for (let singleReaction of json) {
    const [x, y, senderId, type] = singleReaction.split(',');

    if (type && x !== undefined && y !== undefined) {
      if (senderId !== clientId) {
        renderIcon({ x, y, type, senderId });
      }
    }
  }
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const parameterValue = regex.exec(url);

  if (!parameterValue) return null;
  if (!parameterValue[2]) return '';
  return decodeURIComponent(parameterValue[2].replace(/\+/g, ' '));
}

function handleAddEmoji(event) {
  const bounds = emojiContainer.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  const icon = { x, y, type: selectedEmoji, senderId: clientId };
  renderIcon(icon);
  notifyStream({ ...icon, channelArn });
}

function handleEmojiToggle(event) {
  const id = event.target.getAttribute('data-id');
  if (!id) {
    return;
  }

  selectedEmoji = id;
  updateEmojiSelection();
}

function renderIcon(icon) {
  const iconEl = document.createElement('div');
  iconEl.classList.add('icon');
  iconEl.innerText = iconTypeMap[icon.type];
  iconEl.style.top = `calc(${icon.y * 100}% - 18px)`;
  iconEl.style.left = `calc(${icon.x * 100}% - 18px)`;
  emojiContainer.append(iconEl);

  setTimeout(() => {
    iconEl.classList.add('fade');
  }, ICON_FADE_START_TIME);
  setTimeout(() => {
    iconEl.remove();
  }, ICON_REMOVE_TIME);
}

function notifyStream(requestBody) {
  const url = endpoints.metadata;
  fetch(url, { method: 'POST', body: JSON.stringify(requestBody) });
}

function updateEmojiSelection() {
  clearActiveSelection();
  const el = document.querySelector(`[data-id="${selectedEmoji}"].emoji-btn`);
  if (!el) {
    console.error(`Invalid emoji ${selectedEmoji} not found`);
  } else {
    el.classList.add('active');
  }
}

function clearActiveSelection() {
  [].forEach.call(document.getElementsByClassName('emoji-btn'), function (el) {
    el.classList.remove('active');
  });
}

function addSocialReactionQueue(dataSocialReactions) {
  console.log('Data from WebSocket Social Reactions', dataSocialReactions);
}

function connectToWebSocket() {
  let webSocket = null;
  const showDebugInfo = true;

  webSocket = createSocket(webSocketURL, showDebugInfo, addSocialReactionQueue);

  setOnMessageListener(webSocket, showDebugInfo, addSocialReactionQueue);
}

function main() {
  emojiContainer.addEventListener('click', handleAddEmoji);
  document.querySelector('.emoji-picker').addEventListener('click', handleEmojiToggle);
  updateEmojiSelection();
  window.addEventListener('load', connectToWebSocket);
}
