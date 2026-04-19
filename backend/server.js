const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SCORES_FILE = path.join(__dirname, 'scores.json');

// Fonction pour lire les scores de façon sécurisée
function readScores() {
    try {
        if (!fs.existsSync(SCORES_FILE)) {
            console.log('Fichier scores.json non trouvé, création...');
            fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
            return [];
        }

        const data = fs.readFileSync(SCORES_FILE, 'utf8');

        // Vérifier si le fichier est vide
        if (!data || data.trim() === '') {
            console.log('Fichier scores.json vide, réinitialisation...');
            fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
            return [];
        }

        const scores = JSON.parse(data);

        // Vérifier que c'est bien un tableau
        if (!Array.isArray(scores)) {
            console.log('scores.json n\'est pas un tableau, réinitialisation...');
            fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
            return [];
        }

        return scores;
    } catch (error) {
        console.error('Erreur lecture scores.json:', error.message);
        // Réinitialiser le fichier en cas d'erreur
        fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 2));
        return [];
    }
}

// Fonction pour écrire les scores de façon sécurisée
function writeScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
        return true;
    } catch (error) {
        console.error('Erreur écriture scores.json:', error.message);
        return false;
    }
}

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', status: 'ok' });
});

// Obtenir les meilleurs scores
app.get('/api/scores', (req, res) => {
    const scores = readScores();
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    console.log(`Envoi de ${topScores.length} scores`);
    res.json(topScores);
});

// Sauvegarder un nouveau score
app.post('/api/scores', (req, res) => {
    try {
        console.log('Requête reçue:', req.body);
        const { playerName, score } = req.body;

        // Validation
        if (!playerName || !playerName.trim()) {
            return res.status(400).json({ error: 'Player name required' });
        }

        if (!score || isNaN(score) || score <= 0) {
            return res.status(400).json({ error: 'Valid score required' });
        }

        // Lire les scores existants
        let scores = readScores();

        // Ajouter le nouveau score
        const newScore = {
            id: Date.now(),
            playerName: playerName.trim().substring(0, 20),
            score: parseInt(score),
            date: new Date().toISOString()
        };

        scores.push(newScore);

        // Sauvegarder
        if (writeScores(scores)) {
            console.log('✅ Score sauvegardé:', newScore);
            res.json({ success: true, score: newScore });
        } else {
            throw new Error('Impossible d\'écrire dans le fichier');
        }

    } catch (error) {
        console.error('❌ Erreur sauvegarde score:', error.message);
        res.status(500).json({ error: 'Error saving score: ' + error.message });
    }
});

// Route pour réinitialiser les scores (optionnel, pour debug)
app.delete('/api/scores', (req, res) => {
    writeScores([]);
    res.json({ success: true, message: 'Scores reset' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Test API: http://localhost:${PORT}/api/test`);
    console.log(`📋 Scores file: ${SCORES_FILE}`);

    // Initialiser le fichier des scores
    readScores();
    console.log('✅ Fichier scores.json initialisé');
});