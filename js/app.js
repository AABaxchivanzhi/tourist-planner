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
        this.mapManager.initMap();
        this.initAttractionsList();
        this.updateMapMarkers();
        this.setupEventListeners();
    }

    // Инициализация списка достопримечательностей
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

    // Переключение выбора достопримечательности
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

    // Установить выбранные достопримечательности (для выделения многоугольником)
    setSelectedAttractions(selectedIds) {
        this.selectedAttractions = new Set(selectedIds);
        this.mapManager.updateSelectedAttractions(this.selectedAttractions);
        this.updateMapMarkers();
        this.initAttractionsList();
    }

    // Обновление маркеров на карте
    updateMapMarkers() {
        this.mapManager.addMarkers(attractions, (id) => {
            this.toggleAttraction(id);
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        document.getElementById('findRoute').addEventListener('click', () => {
            this.findOptimalRoute();
        });
        
        document.getElementById('clearSelection').addEventListener('click', () => {
            this.clearSelection();
        });
    }

    // Поиск оптимального маршрута
    findOptimalRoute() {
        const maxDistance = parseInt(document.getElementById('maxDistance').value);
        const selectedCount = this.selectedAttractions.size;
        
        if (selectedCount === 0) {
            this.showMessage('Пожалуйста, выберите хотя бы одну достопримечательность.');
            return;
        }

        // Показываем индикатор загрузки
        this.showMessage(`Расчет маршрута для ${selectedCount} объектов...`);

        // Используем setTimeout чтобы дать интерфейсу обновиться
        setTimeout(() => {
            try {
                const selectedIds = Array.from(this.selectedAttractions);
                const route = this.routePlanner.findOptimalRoute(selectedIds, maxDistance);
                
                if (route.path.length === 0) {
                    this.showMessage('Не удалось построить маршрут с выбранными параметрами. Попробуйте увеличить максимальную длину маршрута.');
                    return;
                }
                
                this.displayResults(route);
                this.mapManager.displayRoute(route, attractions);
            } catch (error) {
                console.error('Ошибка при поиске маршрута:', error);
                this.showMessage('Произошла ошибка при поиске маршрута. Попробуйте выбрать меньше объектов или увеличить максимальную длину.');
            }
        }, 100);
    }

    // Отображение результатов
    displayResults(route) {
        const maxDistance = parseInt(document.getElementById('maxDistance').value);
        const efficiency = route.distance > 0 ? ((route.distance / maxDistance) * 100).toFixed(1) : '0.0';
        
        let resultsHTML = `
            <div class="route-info">
                <h3>Оптимальный маршрут:</h3>
                <ol class="route-list">
        `;
        
        route.path.forEach((id, index) => {
            resultsHTML += `<li><strong>${index + 1}.</strong> ${attractions[id].name}</li>`;
        });
        
        resultsHTML += `
                </ol>
                <div class="stats">
                    <p><strong>Количество объектов:</strong> ${route.path.length}</p>
                    <p><strong>Длина маршрута:</strong> ${route.distance} м</p>
                    <p><strong>Оставшееся расстояние:</strong> ${maxDistance - route.distance} м</p>
                    <p><strong>Эффективность использования:</strong> ${efficiency}%</p>
                </div>
            </div>
        `;
        
        // Добавляем информацию о качестве маршрута
        if (route.path.length === this.selectedAttractions.size) {
            resultsHTML += `<div class="success-message">✓ Все выбранные объекты включены в маршрут</div>`;
        } else {
            resultsHTML += `<div class="warning-message">⚠ В маршрут включено ${route.path.length} из ${this.selectedAttractions.size} объектов</div>`;
        }
        
        document.getElementById('results').innerHTML = resultsHTML;
    }

    // Показать сообщение
    showMessage(message) {
        document.getElementById('results').innerHTML = `<p>${message}</p>`;
    }

    // Очистка выбора
    clearSelection() {
        this.selectedAttractions.clear();
        this.mapManager.updateSelectedAttractions(this.selectedAttractions);
        this.mapManager.clearDrawing();
        this.initAttractionsList();
        this.updateMapMarkers();
        this.mapManager.clearRoute();
        this.showMessage('Выберите достопримечательности и нажмите "Найти оптимальный маршрут"');
    }
}

// Создание и инициализация приложения
const app = new TourismPlannerApp();