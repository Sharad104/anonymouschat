// Import required packages
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Variable to store user count for anonymous names
let userCount = 0;
let activeUsers = 0; // Track active users

// Serve static files (public folder for frontend)
app.use(express.static('public'));

// Poll data storage (if you want to persist polls across connections)
let polls = [];

// Socket.IO for real-time communication
io.on('connection', (socket) => {
    // Assign anonymous username
    userCount++;
    const username = `anon${userCount}`;
    socket.username = username;
    activeUsers++; // Increment active users

    // Notify all users that a new user has joined
    io.emit('user-connected', username);

    // Handle chat messages
    socket.on('chat-message', (message) => {
        io.emit('chat-message', { username, message });
    });

    // Handle creating a new poll
    socket.on('create-poll', ({ question, options }) => {
        const pollId = `poll${Date.now()}`;  // Unique poll ID based on timestamp
        const poll = {
            id: pollId,
            question,
            options,
            votes: Array(options.length).fill(0)  // Initialize vote count for each option
        };
        polls.push(poll);  // Store the poll
        io.emit('new-poll', poll);  // Broadcast the poll to all users
    });

    // Handle voting on a poll
    socket.on('vote', ({ pollId, optionIndex }) => {
        const poll = polls.find(p => p.id === pollId);
        if (poll) {
            poll.votes[optionIndex]++;
            io.emit('poll-update', { pollId, voteCounts: poll.votes, options: poll.options });
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        activeUsers--; // Decrement active users
        io.emit('user-disconnected', username);

        // Reset user count if no active users are left
        if (activeUsers === 0) {
            userCount = 0; // Reset anonymous name count
        }
    });
});

// Start server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
