Tetris Game with AngularJS and Node.js

A classic Tetris game implementation with a modern web interface, featuring real-time gameplay, score tracking, and a backend API for saving high scores.

## Features

- Classic Tetris gameplay with all seven tetromino shapes
- Progressive difficulty with increasing speed at higher levels
- Score tracking based on lines cleared and current level
- Next piece preview
- Keyboard controls for intuitive gameplay
- High score system with persistent storage
- Pause and reset functionality
- Responsive design

## Tech Stack

- \*\*Frontend\*\*: AngularJS 1.8.2
- \*\*Backend\*\*: Node.js with Express
- \*\*Styling\*\*: Custom CSS with gradient design

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Modern web browser

## Installation

### 1. Clone or download the project

\`\`\`bash
git clone <repository-url>
cd tetris-app

  

  

### **2\. Install backend dependencies**

bash

cd backend
npm install

  

  

### **3\. Start the backend server**

bash

node server.js

  

  

The backend server will run on `http://localhost:3000`

### **4\. Start the frontend server**

Open a new terminal and navigate to the frontend directory:

bash

cd frontend
npx http-server -p 8000

  

  

### **5\. Access the game**

Open your browser and navigate to `http://localhost:8000`

## **Project Structure**

text

tetris-app/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── scores.json        # Persistent score storage
└── frontend/
    ├── index.html         # Main HTML entry point
    ├── css/
    │   └── style.css      # Game styling
    ├── js/
    │   ├── app.js         # AngularJS module configuration
    │   ├── service.js     # API service for score management
    │   └── tetris.js      # Tetris game logic and controller
    └── partials/
        └── game.html      # Game template view

  

  

## **How to Play**

### **Game Objective**

Clear horizontal lines by arranging falling tetromino pieces. The game ends when pieces stack up to the top of the playing field.

### **Scoring System**

-   1 line: 100 points × level
-   2 lines: 300 points × level
-   3 lines: 500 points × level
-   4 lines: 800 points × level

### **Controls**

-   Left Arrow (←): Move piece left
-   Right Arrow (→): Move piece right
-   Down Arrow (↓): Soft drop (move down faster)
-   Up Arrow (↑): Rotate piece
-   Spacebar: Hard drop (instant drop to bottom)
-   P Key: Pause/Resume game

### **Game Interface**

-   Score: Current game score
-   Level: Current difficulty level (increases every 10 lines)
-   Lines: Total lines cleared
-   Next Piece: Preview of the upcoming tetromino
-   Top Scores: Leaderboard showing the 10 highest scores

## **API Endpoints**

### **GET /api/scores**

Returns the top 10 high scores.

Response example:

json

\[
  {
    "id": 1234567890,
    "playerName": "Player1",
    "score": 2500,
    "date": "2024-01-01T12:00:00.000Z"
  }
\]

  

  

### **POST /api/scores**

Saves a new score.

Request body:

json

{
  "playerName": "Player1",
  "score": 2500
}

  

  

Response example:

json

{
  "success": true,
  "score": {
    "id": 1234567890,
    "playerName": "Player1",
    "score": 2500,
    "date": "2024-01-01T12:00:00.000Z"
  }
}

  

  

## **Game Mechanics**

### **Tetromino Pieces**

The game includes seven different shapes:

-   I: Cyan line piece (4 blocks in a row)
-   O: Yellow square (2x2 block)
-   T: Purple T-shaped piece
-   S: Green S-shaped piece
-   Z: Red Z-shaped piece
-   L: Orange L-shaped piece
-   J: Blue J-shaped piece

### **Difficulty Progression**

-   Level increases every 10 lines cleared
-   Game speed increases as level rises
-   Minimum speed: 100ms per step (maximum difficulty)
-   Maximum speed: 500ms per step (starting difficulty)

## **Development**

### **Running in Development Mode**

1.  Backend will auto-restart if using nodemon:

bash

cd backend
npm install -g nodemon
nodemon server.js

  

  

1.  Frontend can use any static file server

### **Customization**

-   Adjust game speed: Modify the `speed` calculation in `tetris.js`
-   Change board size: Update `COLS` and `ROWS` constants
-   Modify scoring: Edit the `points` array in `clearLines()` function
-   Change colors: Update the `TETROMINOS` array color values

## **Troubleshooting**

### **Backend won't start**

-   Check if port 3000 is available
-   Ensure all dependencies are installed: `npm install`
-   Verify Node.js version is compatible

### **Frontend shows blank page**

-   Check browser console for JavaScript errors
-   Verify all script files are loaded correctly
-   Ensure the backend server is running
-   Check if the partials folder contains game.html

### **Scores not saving**

-   Verify backend server is running on port 3000
-   Check if scores.json is writable
-   Look for CORS errors in browser console

## **Browser Compatibility**

Tested and working on:

-   Google Chrome (latest)
-   Mozilla Firefox (latest)
-   Safari (latest)
-   Microsoft Edge (latest)

## **Performance Considerations**

-   Game uses requestAnimationFrame for smooth rendering
-   Efficient collision detection algorithm
-   Minimal DOM manipulation
-   Lightweight AngularJS implementation

## **Future Improvements**

-   Add sound effects
-   Implement touch controls for mobile devices
-   Add difficulty selection
-   Include game statistics (play time, pieces placed)
-   Add multiplayer mode
-   Implement undo functionality
-   Add themes and visual effects

## **License**

This project is open source and available for educational purposes.

## **Acknowledgments**

-   Classic Tetris game design by Alexey Pajitnov
-   AngularJS team for the frontend framework
-   Node.js community for backend tools

## **Support**

For issues or questions, please check the troubleshooting section or review the code comments for detailed explanations of game mechanics.
