angular.module('tetrisApp')
    .factory('ScoreService', ['$http', '$q', function($http, $q) {
        const API_URL = 'http://localhost:3000/api';

        return {
            getTopScores: function() {
                return $http({
                    method: 'GET',
                    url: API_URL + '/scores'
                }).then(function(response) {
                    return response.data;
                }).catch(function(error) {
                    console.error('GET Error:', error);
                    return $q.reject(error);
                });
            },

            saveScore: function(playerName, score) {
                console.log('Saving score:', playerName, score);

                return $http({
                    method: 'POST',
                    url: API_URL + '/scores',
                    data: {
                        playerName: playerName,
                        score: score
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Important: ne pas transformer la réponse automatiquement
                    transformResponse: [function(data) {
                        return data;
                    }]
                }).then(function(response) {
                    // Vérifier le statut de la réponse
                    if (response.status === 200 || response.status === 201) {
                        // Essayer de parser la réponse si ce n'est pas vide
                        if (response.data && typeof response.data === 'string') {
                            try {
                                return JSON.parse(response.data);
                            } catch(e) {
                                return { success: true };
                            }
                        }
                        return response.data || { success: true };
                    } else {
                        throw new Error('Server returned status ' + response.status);
                    }
                }).catch(function(error) {
                    console.error('Save Error details:', error);
                    // Si c'est une erreur de parsing JSON mais que le score est sauvegardé
                    if (error.status === 200 || error.status === 201) {
                        console.log('Score was actually saved despite error');
                        return { success: true };
                    }
                    return $q.reject(error);
                });
            }
        };
    }]);