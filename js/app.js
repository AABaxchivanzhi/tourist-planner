// Основной модуль приложения
class TourismPlannerApp {
    constructor() {
        this.mapManager = new MapManager();
        this.routePlanner = new RoutePlanner(attractions, distanceMatrix);
        this.selectedAttractions = new Set();
        
        this.init();
    }

    // Инициализация приложения
    init() {
        // Центрируем карту на Вологде
        this.mapManager.initMap([59.220, 39.890], 14);
        this.initAttractionsList();
        this.updateMapMarkers();
        this.setupEventListeners();
    }

    // Остальной код без изменений...
    initAttractionsList() {
        const attractionsList = document.getElementById('attractionsList');
        attractionsList.innerHTML = '';
        
        attractions.forEach(attraction => {
            const item = document.createElement('div');
            item.className = 'attraction-item';
            if (this.selectedAttractions.has(attraction.id)) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <input type="checkbox" class="attraction-checkbox" id="attraction-${attraction.id}" 
                       ${this.selectedAttractions.has(attraction.id) ? 'checked' : ''}>
                <label for="attraction-${attraction.id}">${attraction.name}</label>
            `;
            
            item.addEventListener('click', () => {
                this.toggleAttraction(attraction.id);
            });
            
            attractionsList.appendChild(item);
        });
    }

    toggleAttraction(id) {
        if (this.selectedAttractions.has(id)) {
            this.selectedAttractions.delete(id);
        } else {
            this.selectedAttractions.add(id);
        }
        
        this.mapManager.updateSelectedAttractions(this.selectedAttractions);
        this.updateMapMarkers();
        this.initAttractionsList();
    }

    updateMapMarkers() {
        this.mapManager.addMarkers(attractions, (id) => {
            this.toggleAttraction(id);
        });
    }

    setupEventListeners() {
        document.getElementById('findRoute').addEventListener('click', () => {
            this.findOptimalRoute();
        });
        
        document.getElementById('clearSelection').addEventListener('click', () => {
            this.clearSelection();
        });
    }

    findOptimalRoute() {
        const maxDistance = parseInt(document.getElementById('maxDistance').value);
        
        if (this.selectedAttractions.size === 0) {
            this.showMessage('Пожалуйста, выберите хотя бы одну достопримечательность.');
            return;
        }
        
        const selectedIds = Array.from(this.selectedAttractions);
        const route = this.routePlanner.findOptimalRoute(selectedIds, maxDistance);
        
        if (route.path.length === 0) {
            this.showMessage('Не удалось построить маршрут с выбранными параметрами. Попробуйте увеличить максимальную длину маршрута.');
            return;
        }
        
        this.displayResults(route);
        this.mapManager.displayRoute(route, attractions);
    }

    displayResults(route) {
        let resultsHTML = `
            <div class="route-info">
                <h3>Найденный маршрут:</h3>
                <ol class="route-list">
        `;
        
        route.path.forEach(id => {
            resultsHTML += `<li>${attractions[id].name}</li>`;
        });
        
        resultsHTML += `
                </ol>
                <div class="stats">
                    <p>Количество объектов: ${route.path.length}</p>
                    <p>Длина маршрута: ${route.distance} м</p>
                </div>
            </div>
        `;
        
        document.getElementById('results').innerHTML = resultsHTML;
    }

    showMessage(message) {
        document.getElementById('results').innerHTML = `<p>${message}</p>`;
    }

    clearSelection() {
        this.selectedAttractions.clear();
        this.mapManager.updateSelectedAttractions(this.selectedAttractions);
        this.initAttractionsList();
        this.updateMapMarkers();
        this.mapManager.clearRoute();
        this.showMessage('Выберите достопримечательности и нажмите "Найти оптимальный маршрут"');
    }
}

// Создание и инициализация приложения
const app = new TourismPlannerApp();