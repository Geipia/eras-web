class Block {
    constructor(erazId, previousHash, transactions = []) {
        this.erazId = erazId;
        this.previousHash = previousHash;
        this.transactions = transactions;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return `${this.erazId}${this.previousHash}${JSON.stringify(this.transactions)}`.hashCode();
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "0");
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        this.saveChain();
    }

    saveChain() {
        localStorage.setItem('blockchain', JSON.stringify(this.chain));
    }

    loadChain() {
        const savedChain = localStorage.getItem('blockchain');
        if (savedChain) {
            this.chain = JSON.parse(savedChain).map(blockData => {
                const block = new Block(blockData.erazId, blockData.previousHash, blockData.transactions);
                block.hash = blockData.hash;
                return block;
            });
        }
    }
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString(16);
};

const blockchain = new Blockchain();
blockchain.loadChain();
updateBlockchainDisplay();

function createEraz() {
    const erazId = parseInt(document.getElementById('erazIdInput').value);
    if (isValidErazId(erazId)) {
        const newBlock = new Block(erazId, blockchain.getLastBlock().hash);
        newBlock.addTransaction(`Création de l'Eraz avec l'ID ${erazId}`);
        blockchain.addBlock(newBlock);

        updateMinedIdsDisplay();
        updateBlockchainDisplay();
    } else {
        alert("ID invalide ou déjà utilisé.");
    }
}

function isValidErazId(erazId) {
    if (erazId % 751953751953 !== 0) return false;
    for (const block of blockchain.chain) {
        if (block.erazId === erazId) return false;
    }
    return true;
}

function updateMinedIdsDisplay() {
    const minedIds = blockchain.chain.slice(1).map(block => block.erazId).join('\n');
    document.getElementById('minedIds').value = minedIds;
}

function updateBlockchainDisplay() {
    const blockchainHistory = blockchain.chain.map(block => {
        return `ID: ${block.erazId}, Hash: ${block.hash}, Previous Hash: ${block.previousHash}, Transactions: ${block.transactions.join('; ')}`;
    }).join('\n\n');
    document.getElementById('blockchainHistory').value = blockchainHistory;
}

function viewTransactions() {
    const erazId = parseInt(document.getElementById('erazViewInput').value);
    const block = blockchain.chain.find(block => block.erazId === erazId);
    const transactionsHistory = block ? block.transactions.join('\n') : "Aucune transaction trouvée pour cet Eraz ID.";
    document.getElementById('transactionsHistory').value = transactionsHistory;
}

function createEraz() {
    const erazId = parseInt(document.getElementById('erazIdInput').value);
    if (isValidErazId(erazId)) {
        const newBlock = new Block(erazId, blockchain.getLastBlock().hash);
        newBlock.addTransaction(`Création de l'Eraz avec l'ID ${erazId}`);
        blockchain.addBlock(newBlock);

        // Créer et télécharger le fichier .eraz
        downloadErazFile(erazId);

        updateMinedIdsDisplay();
        updateBlockchainDisplay();
    } else {
        alert("ID invalide ou déjà utilisé.");
    }
}

function downloadErazFile(erazId) {
    const content = `ID de l'eraz: ${erazId}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${erazId}.eraz`;
    a.click();

    URL.revokeObjectURL(url);
}
