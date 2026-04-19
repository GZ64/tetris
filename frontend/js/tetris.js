angular.module('tetrisApp')
    .controller('TetrisController', ['$scope', '$interval', '$timeout', 'ScoreService',
        function($scope, $interval, $timeout, ScoreService) {

            // Constantes du jeu
            const COLS = 10;
            const ROWS = 20;
            const BLOCK_SIZE = 30;

            // Tétrominos
            const TETROMINOS = [
                { shape: [[1,1,1,1]], color: '#00e5f0' },
                { shape: [[1,1],[1,1]], color: '#f0e500' },
                { shape: [[0,1,0],[1,1,1]], color: '#d400d4' },
                { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
                { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
                { shape: [[1,0,0],[1,1,1]], color: '#f0a000' },
                { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }
            ];

            // État du jeu
            $scope.score = 0;
            $scope.level = 1;
            $scope.lines = 0;
            $scope.gameActive = false;
            $scope.gameOver = false;
            $scope.playerName = '';
            $scope.topScores = [];
            $scope.saving = false;

            let board = [];
            let currentPiece = null;
            let nextPiece = null;
            let gameInterval = null;
            let canvas = null;
            let ctx = null;
            let nextCanvas = null;
            let nextCtx = null;

            // Initialisation du plateau
            function initBoard() {
                board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
            }

            // Pièce aléatoire
            function getRandomPiece() {
                const index = Math.floor(Math.random() * TETROMINOS.length);
                const tetromino = TETROMINOS[index];
                return {
                    shape: tetromino.shape.map(row => [...row]),
                    color: tetromino.color,
                    x: Math.floor((COLS - tetromino.shape[0].length) / 2),
                    y: 0
                };
            }

            // Dessiner le plateau
            function drawBoard() {
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                for (let row = 0; row < ROWS; row++) {
                    for (let col = 0; col < COLS; col++) {
                        if (board[row][col]) {
                            ctx.fillStyle = board[row][col];
                            ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                        }
                        ctx.strokeStyle = '#333';
                        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }

                if (currentPiece) {
                    for (let row = 0; row < currentPiece.shape.length; row++) {
                        for (let col = 0; col < currentPiece.shape[row].length; col++) {
                            if (currentPiece.shape[row][col]) {
                                ctx.fillStyle = currentPiece.color;
                                ctx.fillRect((currentPiece.x + col) * BLOCK_SIZE,
                                    (currentPiece.y + row) * BLOCK_SIZE,
                                    BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                            }
                        }
                    }
                }
            }

            // Dessiner la pièce suivante
            function drawNextPiece() {
                if (!nextCtx) return;
                nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

                if (nextPiece) {
                    const offsetX = (nextCanvas.width - (nextPiece.shape[0].length * 25)) / 2;
                    const offsetY = (nextCanvas.height - (nextPiece.shape.length * 25)) / 2;

                    for (let row = 0; row < nextPiece.shape.length; row++) {
                        for (let col = 0; col < nextPiece.shape[row].length; col++) {
                            if (nextPiece.shape[row][col]) {
                                nextCtx.fillStyle = nextPiece.color;
                                nextCtx.fillRect(offsetX + col * 25, offsetY + row * 25, 24, 24);
                            }
                        }
                    }
                }
            }

            // Vérifier collision
            function checkCollision(piece, offsetX, offsetY) {
                for (let row = 0; row < piece.shape.length; row++) {
                    for (let col = 0; col < piece.shape[row].length; col++) {
                        if (piece.shape[row][col]) {
                            const newX = piece.x + offsetX + col;
                            const newY = piece.y + offsetY + row;

                            if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                            if (newY >= 0 && board[newY] && board[newY][newX]) return true;
                        }
                    }
                }
                return false;
            }

            // Fusionner la pièce
            function mergePiece() {
                for (let row = 0; row < currentPiece.shape.length; row++) {
                    for (let col = 0; col < currentPiece.shape[row].length; col++) {
                        if (currentPiece.shape[row][col]) {
                            const y = currentPiece.y + row;
                            const x = currentPiece.x + col;
                            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                                board[y][x] = currentPiece.color;
                            }
                        }
                    }
                }

                clearLines();
                spawnNewPiece();
            }

            // Effacer les lignes
            function clearLines() {
                let linesCleared = 0;

                for (let row = ROWS - 1; row >= 0; row--) {
                    let full = true;
                    for (let col = 0; col < COLS; col++) {
                        if (!board[row][col]) {
                            full = false;
                            break;
                        }
                    }

                    if (full) {
                        board.splice(row, 1);
                        board.unshift(Array(COLS).fill(0));
                        linesCleared++;
                        row++;
                    }
                }

                if (linesCleared > 0) {
                    const points = [0, 100, 300, 500, 800];
                    const scoreToAdd = points[linesCleared] * $scope.level;
                    $scope.score += scoreToAdd;
                    $scope.lines += linesCleared;
                    $scope.level = Math.floor($scope.lines / 10) + 1;

                    // Utiliser $applyAsync pour éviter les conflits de digest
                    $scope.$applyAsync();

                    if (gameInterval) {
                        $interval.cancel(gameInterval);
                        startGameLoop();
                    }
                }
            }

            // Apparition nouvelle pièce
            function spawnNewPiece() {
                if (!nextPiece) nextPiece = getRandomPiece();

                currentPiece = {
                    shape: nextPiece.shape.map(row => [...row]),
                    color: nextPiece.color,
                    x: Math.floor((COLS - nextPiece.shape[0].length) / 2),
                    y: 0
                };

                nextPiece = getRandomPiece();

                if (checkCollision(currentPiece, 0, 0)) {
                    gameOver();
                }

                drawNextPiece();
                drawBoard();
            }

            // Déplacer
            function movePiece(dx, dy) {
                if (!currentPiece || !$scope.gameActive) return false;

                if (!checkCollision(currentPiece, dx, dy)) {
                    currentPiece.x += dx;
                    currentPiece.y += dy;
                    drawBoard();
                    return true;
                } else if (dy === 1) {
                    mergePiece();
                    drawBoard();
                }
                return false;
            }

            // Rotation
            function rotatePiece() {
                if (!currentPiece || !$scope.gameActive) return;

                const rotated = currentPiece.shape[0].map((_, index) =>
                    currentPiece.shape.map(row => row[index]).reverse()
                );

                const originalShape = currentPiece.shape;
                currentPiece.shape = rotated;

                if (checkCollision(currentPiece, 0, 0)) {
                    currentPiece.shape = originalShape;
                } else {
                    drawBoard();
                }
            }

            // Hard drop
            function hardDrop() {
                if (!currentPiece || !$scope.gameActive) return;

                while (!checkCollision(currentPiece, 0, 1)) {
                    currentPiece.y++;
                }
                mergePiece();
                drawBoard();
            }

            // Game over
            function gameOver() {
                $scope.gameActive = false;
                $scope.gameOver = true;
                if (gameInterval) {
                    $interval.cancel(gameInterval);
                    gameInterval = null;
                }
                // Utiliser $applyAsync pour éviter les erreurs de digest
                $scope.$applyAsync();
            }

            // Boucle de jeu
            function startGameLoop() {
                if (gameInterval) {
                    $interval.cancel(gameInterval);
                }
                const speed = Math.max(100, 500 - ($scope.level - 1) * 30);
                gameInterval = $interval(() => {
                    if ($scope.gameActive && currentPiece) {
                        movePiece(0, 1);
                    }
                }, speed);
            }

            // Démarrer le jeu
            $scope.startGame = function() {
                if (!$scope.playerName || !$scope.playerName.trim()) {
                    alert('Please enter your name');
                    return;
                }

                initBoard();
                $scope.score = 0;
                $scope.level = 1;
                $scope.lines = 0;
                $scope.gameActive = true;
                $scope.gameOver = false;

                nextPiece = getRandomPiece();
                spawnNewPiece();

                startGameLoop();
                drawBoard();
                drawNextPiece();

                // Pas besoin de $apply ici, AngularJS le fait automatiquement
            };

            // Pause
            $scope.pauseGame = function() {
                if ($scope.gameActive) {
                    $scope.gameActive = false;
                    if (gameInterval) {
                        $interval.cancel(gameInterval);
                        gameInterval = null;
                    }
                } else if (!$scope.gameOver && $scope.score > 0) {
                    $scope.gameActive = true;
                    startGameLoop();
                }
                // Pas de $apply ici
            };

            // Reset
            $scope.resetGame = function() {
                if (gameInterval) {
                    $interval.cancel(gameInterval);
                    gameInterval = null;
                }
                $scope.gameActive = false;
                $scope.gameOver = false;
                $scope.score = 0;
                $scope.level = 1;
                $scope.lines = 0;
                initBoard();
                drawBoard();
                if (nextCtx) {
                    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
                }
                // Pas de $apply ici
            };

            // Sauvegarde locale de secours
            $scope.saveScoreLocal = function() {
                let localScores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');

                localScores.push({
                    id: Date.now(),
                    playerName: $scope.playerName,
                    score: $scope.score,
                    date: new Date().toISOString()
                });

                localScores.sort((a, b) => b.score - a.score);
                localScores = localScores.slice(0, 10);

                localStorage.setItem('tetrisScores', JSON.stringify(localScores));
                $scope.topScores = localScores;

                alert('✅ Score saved locally!');
                $scope.gameOver = false;
                $scope.gameActive = false;
                // Pas besoin de $apply ici, AngularJS le fait automatiquement
            };

            // Sauvegarder le score (version corrigée sans $apply manuel)
            $scope.saveScore = function() {
                if (!$scope.playerName || !$scope.playerName.trim()) {
                    alert('Please enter your name');
                    return;
                }

                if ($scope.score <= 0) {
                    alert('No score to save');
                    return;
                }

                $scope.saving = true;

                ScoreService.saveScore($scope.playerName, $scope.score)
                    .then(function(response) {
                        console.log('Save successful:', response);
                        alert('✅ Score saved successfully!');
                        return $scope.loadScores();
                    })
                    .then(function() {
                        $scope.gameOver = false;
                        $scope.gameActive = false;
                        $scope.saving = false;
                    })
                    .catch(function(error) {
                        console.error('Save error:', error);
                        alert('⚠️ Error saving score to server. Save locally?');
                        if (confirm('Save score locally instead?')) {
                            $scope.saveScoreLocal();
                        }
                        $scope.saving = false;
                    });
                // Pas de $apply ici - tout est géré par les promesses AngularJS
            };

            // Charger les scores
            $scope.loadScores = function() {
                return ScoreService.getTopScores()
                    .then(function(data) {
                        $scope.topScores = data;
                        console.log('Scores loaded:', $scope.topScores);
                    })
                    .catch(function(error) {
                        console.error('Error loading scores:', error);
                        const localScores = localStorage.getItem('tetrisScores');
                        if (localScores) {
                            $scope.topScores = JSON.parse(localScores);
                        }
                        return [];
                    });
                // Pas de $apply ici
            };

            // Contrôles clavier
            function handleKeyPress(e) {
                if (!$scope.gameActive) return;

                switch(e.keyCode) {
                    case 37: e.preventDefault(); movePiece(-1, 0); break;
                    case 39: e.preventDefault(); movePiece(1, 0); break;
                    case 40: e.preventDefault(); movePiece(0, 1); break;
                    case 38: e.preventDefault(); rotatePiece(); break;
                    case 32: e.preventDefault(); hardDrop(); break;
                    case 80: e.preventDefault(); $scope.pauseGame(); break;
                }
                // Pas besoin de $apply ici car les événements DOM sont déjà dans un digest
            }

            // Initialisation des canvas
            function initCanvas() {
                canvas = document.getElementById('tetrisCanvas');
                if (canvas) ctx = canvas.getContext('2d');
                nextCanvas = document.getElementById('nextCanvas');
                if (nextCanvas) nextCtx = nextCanvas.getContext('2d');

                initBoard();
                drawBoard();

                window.addEventListener('keydown', handleKeyPress);
            }

            // Initialisation avec $timeout pour garantir que le DOM est chargé
            $timeout(function() {
                initCanvas();
                $scope.loadScores();
            }, 100);
        }]);