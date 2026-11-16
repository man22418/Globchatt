const people = [
  {
    id: 'maya', name: 'Maya Chen', location: 'Singapore · 8:42 PM', initials: 'MC', color: '#db8d72', online: true,
    messages: [
      { text: 'Hey! I saw your photos from the coast — the colors are incredible 🌊', time: '8:31 PM' },
      { text: 'Thank you! It was a little town near Lisbon. Have you ever been?', time: '8:34 PM', own: true },
      { text: 'Not yet, but it’s officially on my list now!', time: '8:36 PM' }
    ]
  },
  {
    id: 'leo', name: 'Leo Martins', location: 'Lisbon, Portugal', initials: 'LM', color: '#6e9e8b', online: true,
    messages: [
      { text: 'Hi from Lisbon! Always happy to meet people who love design.', time: 'Yesterday' },
      { text: 'What kind of projects are you working on?', time: 'Yesterday', own: true }
    ]
  },
  {
    id: 'amina', name: 'Amina Hassan', location: 'Cairo, Egypt', initials: 'AH', color: '#ba8c52', online: false,
    messages: [
      { text: 'The book recommendation was perfect. I finished it on my flight!', time: 'Mon' },
      { text: 'So glad you liked it! I have another one for you.', time: 'Mon', own: true }
    ]
  },
  {
    id: 'noah', name: 'Noah Williams', location: 'Toronto, Canada', initials: 'NW', color: '#7183bd', online: true,
    messages: [
      { text: 'That sounds like a great plan. Let’s trade playlists sometime 🎧', time: 'Sun' }
    ]
  },
  {
    id: 'yuki', name: 'Yuki Tanaka', location: 'Tokyo, Japan', initials: 'YT', color: '#c47c9e', online: false,
    messages: [
      { text: 'Good morning from Tokyo! Hope you have a lovely day.', time: 'Sat' }
    ]
  },
  {
    id: 'lucia', name: 'Lucía Rivera', location: 'Mexico City, Mexico', initials: 'LR', color: '#d38a55', online: true,
    messages: [
      { text: 'Just found a tiny café with the best pan dulce. What’s your favorite local treat?', time: '9:12 AM' }
    ]
  },
  {
    id: 'samir', name: 'Samir Patel', location: 'Mumbai, India', initials: 'SP', color: '#6987b8', online: true,
    messages: [
      { text: 'The monsoon clouds over the city are beautiful today ☁️', time: '8:05 AM' }
    ]
  },
  {
    id: 'ella', name: 'Ella Johansson', location: 'Stockholm, Sweden', initials: 'EJ', color: '#7c9a75', online: false,
    messages: [
      { text: 'I’ve been collecting cozy book recommendations for winter. Any favorites?', time: 'Tue' }
    ]
  },
  {
    id: 'kwame', name: 'Kwame Mensah', location: 'Accra, Ghana', initials: 'KM', color: '#aa765e', online: true,
    messages: [
      { text: 'Sending greetings from Accra! The music scene here is buzzing tonight 🎶', time: '7:48 PM' }
    ]
  }
];

try {
  const savedPeople = JSON.parse(localStorage.getItem('globechat-people') || '[]');
  if (Array.isArray(savedPeople)) {
    savedPeople.filter((person) => person && person.id && person.name && person.location).forEach((person) => {
      if (!people.some((existing) => existing.id === person.id)) people.push(person);
    });
  }
} catch {
  // Continue with the built-in conversations if saved contacts are unavailable.
}

const chatLayout = document.querySelector('.chat-layout');
const conversationList = document.getElementById('conversationList');
const storyList = document.getElementById('storyList');
const chatHeader = document.getElementById('chatHeader');
const messagesElement = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const searchInput = document.getElementById('searchInput');
const registerDialog = document.getElementById('registerDialog');
const registerForm = document.getElementById('registerForm');
const installButton = document.getElementById('installButton');
const shareButton = document.getElementById('shareButton');
const reelsButton = document.getElementById('reelsButton');
const reelsDialog = document.getElementById('reelsDialog');
const reelsFeed = document.getElementById('reelsFeed');
const reelFile = document.getElementById('reelFile');
const appStatus = document.getElementById('appStatus');
const reelSamples = [
  { creator: 'Lucía · Mexico City', caption: 'A quiet morning and the best pan dulce ☀️', scene: '🥐', likes: 128 },
  { creator: 'Samir · Mumbai', caption: 'Monsoon clouds rolling over the city 🌧️', scene: '☁️', likes: 246 },
  { creator: 'Maya · Singapore', caption: 'Golden hour by the water 🌊', scene: '🌅', likes: 319 }
];
const reels = reelSamples.map((reel) => ({ ...reel, liked: false }));
let reelSampleIndex = 0;
let installPrompt = null;
let activePersonId = people[0].id;

function loadMessages(person) {
  try {
    const saved = localStorage.getItem(`globechat-${person.id}`);
    return saved ? JSON.parse(saved) : person.messages;
  } catch {
    return person.messages;
  }
}

function saveMessages(person, messages) {
  try {
    localStorage.setItem(`globechat-${person.id}`, JSON.stringify(messages));
  } catch {
    // Messages remain available for this visit if browser storage is unavailable.
  }
  chatSync?.postMessage({ type: 'messages', personId: person.id, messages });
}

const chatSync = 'BroadcastChannel' in window ? new BroadcastChannel('globechat-sync') : null;

function refreshSyncedChat(personId) {
  if (personId === activePersonId) renderChat();
  else renderConversations();
}

if (chatSync) {
  chatSync.addEventListener('message', (event) => {
    const data = event.data;
    if (data?.type === 'messages' && people.some((person) => person.id === data.personId)) {
      try { localStorage.setItem(`globechat-${data.personId}`, JSON.stringify(data.messages)); } catch {}
      refreshSyncedChat(data.personId);
    }
    if (data?.type === 'person' && data.person?.id && !people.some((person) => person.id === data.person.id)) {
      people.push(data.person);
      refreshSyncedChat(data.person.id);
      renderStories();
    }
  });
}

window.addEventListener('storage', (event) => {
  if (event.key?.startsWith('globechat-') && event.newValue) {
    const personId = event.key.slice('globechat-'.length);
    if (people.some((person) => person.id === personId)) refreshSyncedChat(personId);
  }
});

function avatarMarkup(person, extraClass = '') {
  return `<span class="person-avatar ${person.online ? 'online' : ''} ${extraClass}" style="background:${person.color}" aria-hidden="true">${person.initials}</span>`;
}

function latestMessage(person) {
  const messages = loadMessages(person);
  return messages[messages.length - 1]?.text || 'Start a conversation';
}

function createReelCard(reel, index) {
    const card = document.createElement('article');
    card.className = 'reel-card';
    if (reel.instagramUrl) {
      const embed = document.createElement('iframe');
      embed.src = reel.instagramUrl.replace(/\/$/, '') + '/embed/';
      embed.title = `Instagram Reel by ${reel.creator}`;
      embed.loading = 'lazy';
      embed.allowFullscreen = true;
      card.append(embed);
      const openLink = document.createElement('a');
      openLink.className = 'instagram-open';
      openLink.href = reel.instagramUrl;
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.textContent = 'Open on Instagram ↗';
      card.append(openLink);
    } else if (reel.url) {
      const video = document.createElement('video');
      video.src = reel.url;
      video.controls = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      card.append(video);
    } else {
      const art = document.createElement('div');
      art.className = 'reel-art';
      const scene = document.createElement('span');
      scene.textContent = reel.scene;
      art.append(scene);
      card.append(art);
    }

    const caption = document.createElement('div');
    caption.className = 'reel-caption';
    const creator = document.createElement('strong');
    creator.textContent = reel.creator;
    const text = document.createElement('p');
    text.textContent = reel.caption;
    caption.append(creator, text);
    const like = document.createElement('button');
    like.className = `reel-like${reel.liked ? ' liked' : ''}`;
    like.type = 'button';
    like.dataset.reel = index;
    like.setAttribute('aria-label', reel.liked ? 'Unlike reel' : 'Like reel');
    const heart = document.createElement('span');
    heart.textContent = reel.liked ? '♥' : '♡';
    const count = document.createElement('span');
    count.textContent = reel.likes;
    like.append(heart, count);
    card.append(caption, like);
    return card;
}

function appendMoreReels() {
  for (let count = 0; count < 6; count += 1) {
    const sample = reelSamples[reelSampleIndex % reelSamples.length];
    const reel = { ...sample, liked: false };
    const index = reels.push(reel) - 1;
    reelsFeed.append(createReelCard(reel, index));
    reelSampleIndex += 1;
  }
}

function renderReels() {
  reelsFeed.replaceChildren();
  reels.forEach((reel, index) => reelsFeed.append(createReelCard(reel, index)));
  appendMoreReels();
}

function renderStories() {
  storyList.replaceChildren();
  people.filter((person) => person.online).forEach((person) => {
    const story = document.createElement('div');
    story.className = 'story';
    const ring = document.createElement('span');
    ring.className = 'story-ring';
    const avatar = document.createElement('span');
    avatar.className = 'story-avatar';
    avatar.style.background = person.color;
    avatar.textContent = person.initials;
    ring.append(avatar);
    const name = document.createElement('span');
    name.textContent = person.name.split(' ')[0];
    story.append(ring, name);
    storyList.append(story);
  });
}

function renderConversations() {
  const query = searchInput.value.trim().toLowerCase();
  conversationList.replaceChildren();
  people.filter((person) => `${person.name} ${person.location} ${person.phone || ''} ${person.email || ''} ${latestMessage(person)}`.toLowerCase().includes(query)).forEach((person) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `conversation${person.id === activePersonId ? ' active' : ''}`;
    button.dataset.person = person.id;
    button.setAttribute('aria-current', person.id === activePersonId ? 'page' : 'false');

    const avatar = document.createElement('span');
    avatar.className = `person-avatar ${person.online ? 'online' : ''}`;
    avatar.style.background = person.color;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = person.initials;

    const copy = document.createElement('span');
    copy.className = 'conversation-copy';
    const top = document.createElement('span');
    top.className = 'conversation-topline';
    const name = document.createElement('span');
    name.className = 'person-name';
    name.textContent = person.name;
    const time = document.createElement('span');
    time.className = 'conversation-time';
    const last = loadMessages(person).at(-1);
    time.textContent = last?.time || '';
    top.append(name, time);
    const preview = document.createElement('span');
    preview.className = 'conversation-preview';
    preview.textContent = latestMessage(person);
    copy.append(top, preview);
    button.append(avatar, copy);
    conversationList.append(button);
  });
}

function addMessage(message, person) {
  const row = document.createElement('article');
  row.className = `message${message.own ? ' own' : ''}`;
  if (!message.own) {
    const avatar = document.createElement('span');
    avatar.className = 'person-avatar';
    avatar.style.background = person.color;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = person.initials;
    row.append(avatar);
  }

  const wrap = document.createElement('div');
  wrap.className = 'message-bubble-wrap';
  const sender = document.createElement('p');
  sender.className = 'message-sender';
  sender.textContent = message.own ? 'You' : person.name;
  const text = document.createElement('p');
  text.className = 'message-text';
  text.textContent = message.text;
  const time = document.createElement('time');
  time.className = 'message-time';
  time.textContent = message.time;
  wrap.append(sender, text, time);
  row.append(wrap);
  messagesElement.append(row);
}

function renderChat() {
  const person = people.find((item) => item.id === activePersonId) || people[0];
  const headerPerson = document.createElement('div');
  headerPerson.className = 'chat-person';
  const avatar = document.createElement('span');
  avatar.className = `person-avatar ${person.online ? 'online' : ''}`;
  avatar.style.background = person.color;
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = person.initials;
  const details = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = person.name;
  const location = document.createElement('p');
  location.textContent = person.online ? `Active now · ${person.location}` : person.location;
  details.append(title, location);
  headerPerson.append(avatar, details);

  const actions = document.createElement('div');
  actions.className = 'header-actions';
  const backButton = document.createElement('button');
  backButton.className = 'header-action back-button';
  backButton.type = 'button';
  backButton.setAttribute('aria-label', 'Back to conversations');
  backButton.textContent = '‹';
  actions.append(backButton);
  [['⌕', 'Search in conversation'], ['⋯', 'More options']].forEach(([symbol, label]) => {
    const button = document.createElement('button');
    button.className = 'header-action';
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    actions.append(button);
  });
  chatHeader.replaceChildren(headerPerson, actions);
  messagesElement.replaceChildren();

  const divider = document.createElement('div');
  divider.className = 'day-divider';
  divider.textContent = 'TODAY';
  messagesElement.append(divider);
  const messages = loadMessages(person);
  if (messages.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = `Say hello to ${person.name.split(' ')[0]} and start a conversation.`;
    messagesElement.append(empty);
  } else {
    messages.forEach((message) => addMessage(message, person));
  }
  messagesElement.scrollTop = messagesElement.scrollHeight;
  renderConversations();
}

chatHeader.addEventListener('click', (event) => {
  if (event.target.closest('.back-button')) chatLayout.classList.remove('show-chat');
});

conversationList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-person]');
  if (!button) return;
  activePersonId = button.dataset.person;
  chatLayout.classList.add('show-chat');
  renderChat();
});

searchInput.addEventListener('input', renderConversations);

reelsButton.addEventListener('click', () => {
  renderReels();
  reelsDialog.showModal();
});
document.getElementById('closeReels').addEventListener('click', () => reelsDialog.close());
document.getElementById('addInstagramReel').addEventListener('click', () => {
  const input = window.prompt('Paste a public Instagram Reel link:');
  if (!input) return;
  try {
    const url = new URL(input.trim());
    const match = url.pathname.match(/^\/reel\/([A-Za-z0-9_-]+)/i);
    if (!['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase()) || !match) {
      throw new Error('invalid reel link');
    }
    const instagramUrl = `https://www.instagram.com/reel/${match[1]}/`;
    reels.push({ creator: 'Instagram Reel', caption: 'Public Instagram Reel', instagramUrl, likes: 0, liked: false });
    renderReels();
    appStatus.textContent = 'Instagram Reel added. If the embed is unavailable, open it directly on Instagram.';
  } catch {
    appStatus.textContent = 'Please paste a valid Instagram Reel URL.';
  }
});
reelFile.addEventListener('change', () => {
  const files = Array.from(reelFile.files);
  if (files.length === 0) return;
  if (files.some((file) => !file.type.startsWith('video/'))) {
    appStatus.textContent = 'Please choose video files only.';
    reelFile.value = '';
    return;
  }
  files.forEach((file) => {
    reels.push({
      creator: 'Your video · This device',
      caption: file.name,
      url: URL.createObjectURL(file),
      likes: 0,
      liked: false
    });
  });
  renderReels();
  reelsFeed.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  appStatus.textContent = `${files.length} video${files.length === 1 ? '' : 's'} added to this device’s Reels preview.`;
  reelFile.value = '';
});
reelsFeed.addEventListener('scroll', () => {
  if (reelsFeed.scrollLeft + reelsFeed.clientWidth >= reelsFeed.scrollWidth - 500) appendMoreReels();
});

reelsFeed.addEventListener('click', (event) => {
  const button = event.target.closest('.reel-like');
  if (!button) return;
  const reel = reels[Number(button.dataset.reel)];
  if (!reel) return;
  reel.liked = !reel.liked;
  reel.likes += reel.liked ? 1 : -1;
  button.classList.toggle('liked', reel.liked);
  button.setAttribute('aria-label', reel.liked ? 'Unlike reel' : 'Like reel');
  button.querySelector('span').textContent = reel.liked ? '♥' : '♡';
  button.querySelector('span:last-child').textContent = reel.likes;
});

document.getElementById('registerButton').addEventListener('click', () => registerDialog.showModal());
document.getElementById('closeRegister').addEventListener('click', () => registerDialog.close());

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('personName').value.trim();
  const phone = document.getElementById('personPhone').value.trim();
  const email = document.getElementById('personEmail').value.trim();
  const location = document.getElementById('personLocation').value.trim() || 'Location not provided';
  if (!name || !phone) return;

  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const colors = ['#db8d72', '#6e9e8b', '#7183bd', '#c47c9e', '#6987b8', '#7c9a75'];
  const person = {
    id: `person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name, location, phone, email, initials, color: colors[people.length % colors.length], online: true, messages: []
  };
  people.push(person);
  try {
    const savedPeople = JSON.parse(localStorage.getItem('globechat-people') || '[]');
    savedPeople.push(person);
    localStorage.setItem('globechat-people', JSON.stringify(savedPeople));
  } catch {
    // The new contact remains available for this visit if browser storage is unavailable.
  }
  chatSync?.postMessage({ type: 'person', person });
  activePersonId = person.id;
  renderStories();
  renderChat();
  registerForm.reset();
  registerDialog.close();
  chatLayout.classList.add('show-chat');
  appStatus.textContent = `${name} added to conversations.`;
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

shareButton.addEventListener('click', async () => {
  const shareData = {
    title: document.title,
    text: 'Join me on GlobeChat',
    url: window.location.href
  };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      appStatus.textContent = 'App link shared.';
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    appStatus.textContent = 'App link copied. You can paste it into a message.';
  } catch {
    appStatus.textContent = 'Copy this page’s address from your browser and send it to others.';
  }
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) {
    appStatus.textContent = 'If installation is supported, use your browser menu and choose Install app or Add to Home Screen.';
    return;
  }
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
});

window.addEventListener('appinstalled', () => {
  appStatus.textContent = 'GlobeChat installed.';
  installPrompt = null;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const person = people.find((item) => item.id === activePersonId);
  const messages = loadMessages(person);
  const time = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
  const message = { text, time, own: true };
  messages.push(message);
  saveMessages(person, messages);
  addMessage(message, person);
  messageInput.value = '';
  messagesElement.scrollTop = messagesElement.scrollHeight;
  renderConversations();
  messageInput.focus();
});

renderStories();
renderChat();
