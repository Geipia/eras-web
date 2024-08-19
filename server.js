const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let blockchain = [];

// Générer le bloc de genèse
const createGenesisBlock = () => {
    return {
        erazId: 0,
        previousHash: "0",
        hash: "genesis-hash",
        transactions: []
    };
};

const calculateHash = (erazId, previousHash, transactions) => {
    return `${erazId}${previousHash}${JSON.stringify(transactions)}`.hashCode();
};

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString(16);
};

blockchain.push(createGenesisBlock());

io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté');

    // Envoyer la blockchain actuelle au nouvel utilisateur
    socket.emit('blockchain', blockchain);

    // Recevoir un nouveau bloc du client
    socket.on('newBlock', (block) => {
        if (isValidNewBlock(block, getLastBlock())) {
            blockchain.push(block);
            io.emit('blockchain', blockchain); // Diffuser la nouvelle blockchain à tous les utilisateurs
        } else {
            console.log("Bloc invalide reçu.");
        }
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

const getLastBlock = () => blockchain[blockchain.length - 1];

const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.hash !== newBlock.previousHash) {
        return false;
    }
    if (calculateHash(newBlock.erazId, newBlock.previousHash, newBlock.transactions) !== newBlock.hash) {
        return false;
    }
    return true;
};

server.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
