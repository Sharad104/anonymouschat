const socket = io();  // Initialize connection to server

// Display chat messages
socket.on('chat-message', ({ username, message }) => {
    const item = document.createElement('li');
    item.textContent = `${username}: ${message}`;
    document.getElementById('messages').appendChild(item);
});

// Display when a user joins
socket.on('user-connected', (username) => {
    const item = document.createElement('li');
    item.textContent = `${username} joined the chat`;
    item.style.fontStyle = 'italic';
    document.getElementById('messages').appendChild(item);
});

// Display when a user leaves
socket.on('user-disconnected', (username) => {
    const item = document.createElement('li');
    item.textContent = `${username} left the chat`;
    item.style.fontStyle = 'italic';
    document.getElementById('messages').appendChild(item);
});

// Send chat messages
document.getElementById('send-btn').onclick = () => {
    const message = document.getElementById('message-input').value;
    socket.emit('chat-message', message);
    document.getElementById('message-input').value = '';
};

// Create a new poll
document.getElementById('create-poll-btn').onclick = () => {
    const question = document.getElementById('poll-question').value;
    const options = document.getElementById('poll-option').value.split(',');

    if (question.trim() === '' || options.length < 2) {
        alert('Please provide a question and at least two options.');
        return;
    }

    socket.emit('create-poll', { question, options });
};

// Display new poll
socket.on('new-poll', ({ id, question, options }) => {
    const pollDiv = document.createElement('div');
    pollDiv.classList.add('poll');
    pollDiv.innerHTML = `<strong>${question}</strong><ul id="${id}-results" class="poll-results"></ul>`;
    
    options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option;
        optionBtn.onclick = () => socket.emit('vote', { pollId: id, optionIndex: index });
        pollDiv.appendChild(optionBtn);
    });
    
    document.getElementById('polls').appendChild(pollDiv);
});

// Update poll results
socket.on('poll-update', ({ pollId, voteCounts, options }) => {
    const pollResults = document.getElementById(`${pollId}-results`);
    pollResults.innerHTML = '';

    options.forEach((option, index) => {
        const voteItem = document.createElement('li');
        voteItem.textContent = `${option}: ${voteCounts[index] || 0} votes`;
        pollResults.appendChild(voteItem);
    });
});
