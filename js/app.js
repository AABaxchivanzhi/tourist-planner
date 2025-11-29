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
    async findOptimalRoute() {  // ← добавь async
        const maxDistance = parseInt(document.getElementById('maxDistance').value);
        const selectedCount = this.selectedAttractions.size;

        if (selectedCount === 0) {
            this.showMessage('Пожалуйста, выберите хотя бы одну достопримечательность.');
            return;
        }

        this.showMessage(`Расчет маршрута для ${selectedCount} объектов...`);

        try {
            const selectedIds = Array.from(this.selectedAttractions);  // ← объяви selectedIds

            // Подготавливаем данные для API
            const requestData = {
                N: selectedIds.length,
                D: maxDistance,
            };

            console.log('Отправка запроса к API:', requestData);

            // Вызов ASP.NET API
            const response = await fetch('http://localhost:5064/api/route/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Получен ответ от API:', result);

            // Преобразуем индексы обратно в исходные ID
            const path = result.path.map(idx => selectedIds[idx]);

            // Создаем объект маршрута для отображения
            const route = {
                path: path,
                distance: result.distance
            };

            this.displayResults(route);
            this.mapManager.displayRoute(route, attractions);

        } catch (error) {
            console.error('Ошибка при вызове API:', error);
            this.showMessage('Произошла ошибка при поиске маршрута. Попробуйте выбрать меньше объектов или увеличить максимальную длину.');
        }
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