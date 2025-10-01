# RoutZ 🗺️

A full-stack pathfinding application that implements Dijkstra's algorithm to find the shortest routes between locations on a campus map. Built with Node.js backend and Next.js frontend.

🌐 **Live Demo**: [routz.chanukadilshan.live](https://routz.chanukadilshan.live)

## 🚀 Features

- **Interactive Campus Map**: Visual representation of campus locations with connected paths
- **Shortest Path Finding**: Uses Dijkstra's algorithm to calculate optimal routes
- **Real-time Visualization**: Dynamic map updates showing the calculated path
- **Route History**: Track and manage previous route calculations
- **Undo Functionality**: Reverse recent pathfinding operations
- **Data Structures Demonstration**: Interactive examples of stacks and other data structures
- **RESTful API**: Well-structured backend with organized endpoints

## 🏗️ Architecture

### Backend (Node.js + Express)

- **Core Algorithms**: Dijkstra's pathfinding and insertion sort implementations
- **Controllers**: Separate logic for graph operations and data structure demos
- **Routes**: Organized API endpoints for different functionalities
- **Data Structures**: Custom implementations of Node and Stack classes

### Frontend (Next.js + React)

- **Interactive UI**: Modern React components with responsive design
- **Map Visualization**: Custom component for displaying campus layout
- **Real-time Updates**: Dynamic route visualization and loading states
- **Component-based**: Modular architecture with reusable components

## 📁 Project Structure

```
RoutZ/
├── backend/                    # Node.js API server
│   ├── controllers/           # Business logic controllers
│   │   ├── dsController.js   # Data structures operations
│   │   └── graphController.js # Graph and pathfinding operations
│   ├── core/                 # Core algorithms
│   │   ├── dijkstra.js      # Dijkstra's algorithm implementation
│   │   └── insertionSort.js # Sorting algorithm
│   ├── routes/               # API route definitions
│   │   ├── dsRoutes.js      # Data structure endpoints
│   │   └── graphRoutes.js   # Graph operation endpoints
│   ├── utils/                # Utility functions and data
│   │   ├── graphData.js     # Campus map data structure
│   │   └── dataStructures/  # Custom data structure classes
│   │       ├── Node.js      # Node class implementation
│   │       └── Stack.js     # Stack class implementation
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js           # Express server entry point
│
├── UI/                        # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── components/   # React components
│   │       │   ├── Demo.js              # Data structures demo
│   │       │   ├── LoadingSpinner.js    # Loading component
│   │       │   └── MapVisualization.js  # Interactive map
│   │       ├── page.js      # Main application page
│   │       ├── layout.js    # App layout wrapper
│   │       └── globals.css  # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── next.config.mjs     # Next.js configuration
│
└── README.md               # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with required environment variables:

```env
PORT=5001
```

4. Start the development server:

```bash
npm run dev
```

The backend will be running at `http://localhost:5001`

### Frontend Setup

1. Navigate to the UI directory:

```bash
cd UI
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

## 🔌 API Endpoints

### Graph Operations

- `GET /api/graph/locations` - Get all available locations
- `POST /api/graph/shortest-path` - Calculate shortest path between two points
- `GET /api/graph/history` - Get route calculation history
- `DELETE /api/graph/undo` - Undo last operation
- `GET /api/graph/can-undo` - Check if undo is available

### Data Structures

- `POST /api/ds/stack` - Stack operations (push/pop/peek)
- `POST /api/ds/sort` - Insertion sort demonstration

## 🎯 Usage

1. **Select Locations**: Choose start and end points from the dropdown menus
2. **Find Route**: Click "Find Route" to calculate the shortest path
3. **View Results**: See the calculated route with distance and path visualization
4. **Explore History**: Review previous route calculations
5. **Undo Operations**: Use the undo feature to reverse recent actions
6. **Demo Mode**: Try the data structures demonstration for educational purposes

## 🧮 Algorithms Implemented

### Dijkstra's Algorithm

- **Purpose**: Find shortest path between two nodes in a weighted graph
- **Time Complexity**: O(V²) where V is the number of vertices
- **Use Case**: Campus navigation and route optimization

### Insertion Sort

- **Purpose**: Sort arrays in ascending order
- **Time Complexity**: O(n²) average case, O(n) best case
- **Use Case**: Educational demonstration of sorting algorithms

## 🎨 Technologies Used

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **Nodemon**: Development server auto-restart

### Frontend

- **Next.js 15.5.4**: React framework with server-side rendering
- **React 19.1.0**: User interface library
- **CSS Modules**: Scoped styling solution
- **JavaScript ES6+**: Modern JavaScript features

## 🚦 Development

### Running in Development Mode

Backend:

```bash
cd backend && npm run dev
```

Frontend:

```bash
cd UI && npm run dev
```

### Building for Production

Frontend:

```bash
cd UI && npm run build && npm start
```

Backend:

```bash
cd backend && npm start
```

## 📊 Campus Map Data

The application uses a predefined campus map with the following locations:

- Main Hall
- Library
- Lab Block
- Cafeteria
- Auditorium
- Admin Office
- Student Center
- Gym
- Parking Area
- Sports Complex
- And more...

Each location is connected with weighted edges representing distances between buildings.

## 📄 License

This project is part of an academic assignment for the Data Structures and Programming Algorithms (DPSA) course.

## 👨‍💻 Authors

**Chanuka** - [Chanukaa2002](https://github.com/Chanukaa2002)
**Amri** - [amriHaneef](https://github.com/amriHaneef)
**Gaveesha** - [Gavee-Liyanage](https://github.com/Gavee-Liyanage)

---

**Note**: This project demonstrates practical implementations of graph algorithms and data structures for educational purposes in the NIBM DPSA course.
