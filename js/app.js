// Основной модуль приложения
class TourismPlannerApp {
    constructor() {
        this.mapManager = new MapManager();
        this.routePlanner = new RoutePlanner(attractions, distanceMatrix);
        this.selectedAttractions = new Set();
        this.savedRoutes = this.loadSavedRoutes();
        
        this.init();
    }

    // Инициализация приложения
    init() {
        this.mapManager.initMap();
        this.initAttractionsList();
        this.updateMapMarkers();
        this.setupEventListeners();
        this.initSavedRoutesList();
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

    // Инициализация списка сохраненных маршрутов
    initSavedRoutesList() {
        const savedRoutesList = document.getElementById('savedRoutesList');
        if (!savedRoutesList) return;
        
        savedRoutesList.innerHTML = '';
        
        if (this.savedRoutes.length === 0) {
            savedRoutesList.innerHTML = '<p class="no-routes">Нет сохраненных маршрутов</p>';
            return;
        }
        
        this.savedRoutes.forEach((route, index) => {
            const routeItem = document.createElement('div');
            routeItem.className = 'saved-route-item';
            routeItem.innerHTML = `
                <div class="route-header">
                    <strong>${route.name}</strong>
                    <span class="route-date">${new Date(route.date).toLocaleDateString()}</span>
                </div>
                <div class="route-info-small">
                    <span>Объектов: ${route.path.length}</span>
                    <span>Длина: ${route.distance}м</span>
                </div>
                <div class="route-actions">
                    <button class="btn-small btn-load" onclick="app.loadRoute(${index})">📂 Загрузить</button>
                    <button class="btn-small btn-delete" onclick="app.deleteRoute(${index})">🗑️ Удалить</button>
                </div>
            `;
            savedRoutesList.appendChild(routeItem);
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

        document.getElementById('saveRoute').addEventListener('click', () => {
            this.saveCurrentRoute();
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
                
                this.currentRoute = route;
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
            resultsHTML += `<li><strong>${index + 1}.</strong><a href=https://yandex.ru/search?text=${attractions[id].name.replace(/ /g, '+')}>${attractions[id].name}</a></li>`;
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
        
        // Добавляем кнопку сохранения
        if (route.path.length > 0) {
            resultsHTML += `
                <div class="save-route-section">
                    <button id="saveRoute" class="save-route-btn">💾 Сохранить маршрут</button>
                </div>
            `;
        }
        
        document.getElementById('results').innerHTML = resultsHTML;
        
        // Добавляем обработчик для кнопки сохранения
        setTimeout(() => {
            const saveBtn = document.getElementById('saveRoute');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveCurrentRoute();
                });
            }
        }, 100);
    }

    // Сохранение текущего маршрута
    saveCurrentRoute() {
        if (!this.currentRoute || this.currentRoute.path.length === 0) {
            this.showMessage('Нет маршрута для сохранения. Сначала постройте маршрут.');
            return;
        }

        const routeName = prompt('Введите название для маршрута:', `Маршрут ${new Date().toLocaleDateString()}`);
        
        if (!routeName || routeName.trim() === '') {
            this.showMessage('Название маршрута не может быть пустым.');
            return;
        }

        const routeToSave = {
            name: routeName.trim(),
            path: this.currentRoute.path,
            distance: this.currentRoute.distance,
            date: new Date().toISOString(),
            selectedAttractions: Array.from(this.selectedAttractions)
        };

        this.savedRoutes.push(routeToSave);
        this.saveRoutesToStorage();
        this.initSavedRoutesList();
        
        this.showMessage(`Маршрут "${routeName}" успешно сохранен!`);
    }

    // Загрузка маршрута
    loadRoute(index) {
        if (index < 0 || index >= this.savedRoutes.length) {
            this.showMessage('Ошибка загрузки маршрута.');
            return;
        }

        const route = this.savedRoutes[index];
        
        // Восстанавливаем выбранные объекты
        this.setSelectedAttractions(route.selectedAttractions);
        
        // Отображаем маршрут
        this.currentRoute = { path: route.path, distance: route.distance };
        this.displayResults(this.currentRoute);
        this.mapManager.displayRoute(this.currentRoute, attractions);
        
        this.showMessage(`Маршрут "${route.name}" загружен.`);
    }

    // Удаление маршрута
    deleteRoute(index) {
        if (index < 0 || index >= this.savedRoutes.length) {
            this.showMessage('Ошибка удаления маршрута.');
            return;
        }

        const routeName = this.savedRoutes[index].name;
        if (confirm(`Вы уверены, что хотите удалить маршрут "${routeName}"?`)) {
            this.savedRoutes.splice(index, 1);
            this.saveRoutesToStorage();
            this.initSavedRoutesList();
            this.showMessage(`Маршрут "${routeName}" удален.`);
        }
    }

    // Загрузка сохраненных маршрутов из localStorage
    loadSavedRoutes() {
        try {
            const saved = localStorage.getItem('tourismPlanner_routes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки маршрутов:', error);
            return [];
        }
    }

    // Сохранение маршрутов в localStorage
    saveRoutesToStorage() {
        try {
            localStorage.setItem('tourismPlanner_routes', JSON.stringify(this.savedRoutes));
        } catch (error) {
            console.error('Ошибка сохранения маршрутов:', error);
            this.showMessage('Ошибка сохранения маршрутов в хранилище.');
        }
    }

    // Показать сообщение
    showMessage(message) {
        document.getElementById('results').innerHTML = `<p>${message}</p>`;
    }

    // Очистка выбора
    clearSelection() {
        this.selectedAttractions.clear();
        this.currentRoute = null;
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