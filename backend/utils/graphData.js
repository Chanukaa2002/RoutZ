export const map = {
  "Main Hall": { 
    "Library": 2, 
    "Cafeteria": 3, 
    "Lab Block": 4, 
    "Auditorium": 5, 
    "Admin Office": 3,
    "Student Center": 4
  },
  
  "Library": { 
    "Main Hall": 2, 
    "Admin Office": 3, 
    "Study Rooms": 2,
    "Computer Lab": 4
  },
  
  "Lab Block": { 
    "Main Hall": 4, 
    "Gym": 2, 
    "Computer Lab": 3,
    "Engineering Building": 5,
    "Science Building": 4
  },
  
  "Computer Lab": {
    "Library": 4,
    "Lab Block": 3,
    "Engineering Building": 2,
    "Study Rooms": 3
  },
  
  "Engineering Building": {
    "Lab Block": 5,
    "Computer Lab": 2,
    "Science Building": 3,
    "Workshop": 4
  },
  
  "Science Building": {
    "Lab Block": 4,
    "Engineering Building": 3,
    "Medical Center": 6,
    "Research Center": 4
  },
  
  "Cafeteria": { 
    "Main Hall": 3, 
    "Student Center": 2,
    "Gym": 4,
    "Dormitory": 5
  },
  
  "Student Center": {
    "Main Hall": 4,
    "Cafeteria": 2,
    "Auditorium": 3,
    "Dormitory": 4,
    "Sports Complex": 6
  },
  
  "Gym": { 
    "Lab Block": 2, 
    "Parking Lot": 3,
    "Cafeteria": 4,
    "Sports Complex": 2
  },
  
  "Sports Complex": {
    "Gym": 2,
    "Student Center": 6,
    "Parking Lot": 4,
    "Dormitory": 5
  },
  
  "Admin Office": { 
    "Library": 3,
    "Main Hall": 3,
    "Medical Center": 4
  },
  
  "Medical Center": {
    "Admin Office": 4,
    "Science Building": 6,
    "Dormitory": 3
  },
  
  "Auditorium": { 
    "Main Hall": 5,
    "Student Center": 3
  },
  
  "Study Rooms": {
    "Library": 2,
    "Computer Lab": 3
  },
  
  "Workshop": {
    "Engineering Building": 4
  },
  
  "Research Center": {
    "Science Building": 4
  },
  
  // Residential & Parking
  "Dormitory": {
    "Cafeteria": 5,
    "Student Center": 4,
    "Sports Complex": 5,
    "Medical Center": 3,
    "Parking Lot": 6
  },
  
  "Parking Lot": { 
    "Gym": 3,
    "Sports Complex": 4,
    "Dormitory": 6
  }
};

export const locations = Object.keys(map)

