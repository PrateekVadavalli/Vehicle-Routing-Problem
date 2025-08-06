# School Bus Routing System

An interactive web-based tool that visualizes student pickup points and generates optimized school bus routes using K-Means clustering and Leaflet.js.


---

## Features

- Mark student pickup locations on an interactive map
- Cluster students using K-Means for efficient routing
- Set start (school) and end (depot) terminals
- Add and manage student details dynamically
- Generate optimal bus routes visually
- Erase mode for map cleanup

---

##Technologies Used

| Tech        | Purpose                    |
|-------------|----------------------------|
| HTML/CSS/JS | Frontend foundation        |
| Leaflet.js  | Interactive mapping        |
| ml-kmeans   | Client-side clustering     |

---

## Folder Structure

project-root/
├── index.html
├── css/
│ ├── main.css
│ └── dashboard.css
├── js/
│ ├── main.js
│ ├── map.js
│ ├── clustering.js
│ ├── routing.js
│ └── ui.js

---

## How It Works

1. Enter total students and number of buses.
2. Mark points on the map to represent student pickup locations.
3. Set start (school) and end (depot) terminals.
4. Fill in student details via modal.
5. Generate routes using K-Means clustering.
6. Visualize clustered and routed paths on the map.

---
