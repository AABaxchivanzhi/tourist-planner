// Основной модуль приложения
class TourismPlannerApp {
    constructor() {
        this.mapManager = new MapManager();
        this.routePlanner = new RoutePlanner(attractions, distanceMatrix);
        this.selectedAttractions = new Set();
        this.requiredAttractions = new Set(); // Обязательные для посещения
        
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
            const isSelected = this.selectedAttractions.has(attraction.id);
            const isRequired = this.requiredAttractions.has(attraction.id);
            
            const item = document.createElement('div');
            item.className = 'attraction-item';
            if (isSelected) {
                item.classList.add('selected');
            }
            if (isRequired) {
                item.classList.add('required');
            }
            
            item.innerHTML = `
                <div class="attraction-controls">
                    <input type="checkbox" class="attraction-checkbox" id="attraction-${attraction.id}" 
                           ${isSelected ? 'checked' : ''}>
                    <button class="star-btn ${isRequired ? 'starred' : ''}" data-id="${attraction.id}">
                        ${isRequired ? '★' : '☆'}
                    </button>
                </div>
                <label for="attraction-${attraction.id}">${attraction.name}</label>
            `;
            
            // Обработчик клика на чекбокс
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('star-btn')) {
                    this.toggleAttraction(attraction.id);
                }
            });
            
            // Обработчик клика на звездочку
            const starBtn = item.querySelector('.star-btn');
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleRequired(attraction.id);
            });
            
            attractionsList.appendChild(item);
        });
    }

    // Переключение выбора достопримечательности
    toggleAttraction(id) {
        if (this.selectedAttractions.has(id)) {
            this.selectedAttractions.delete(id);
            this.requiredAttractions.delete(id); // Убираем из обязательных если снимаем выбор
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
        }, this.requiredAttractions);
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
        const requiredCount = this.requiredAttractions.size;
        

        // Показываем индикатор загрузки
        this.showMessage(`Расчет маршрута для ${selectedCount} объектов (${requiredCount} обязательных)...`);

        setTimeout(() => {
            try {
                const selectedIds = Array.from(this.selectedAttractions);
                const requiredIds = Array.from(this.requiredAttractions);
                const route = this.routePlanner.findOptimalRoute(selectedIds, maxDistance, requiredIds);
                
                if (route.path.length === 0) {
                    this.showMessage('Не удалось построить маршрут с выбранными параметрами. Попробуйте увеличить максимальную длину маршрута.');
                    return;
                }
                
                // Проверяем, что все обязательные точки включены в маршрут
                const missingRequired = requiredIds.filter(id => !route.path.includes(id));
                if (missingRequired.length > 0) {
                    this.showMessage(`Не удалось включить все обязательные объекты в маршрут. Увеличьте максимальную длину маршрута.`);
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
            const isRequired = this.requiredAttractions.has(id);
            const starIcon = isRequired ? ' <span class="required-star">★</span>' : '';
            resultsHTML += `<li><strong>${index + 1}.</strong> ${attractions[id].name}${starIcon}</li>`;
        });
        
        resultsHTML += `
                </ol>
                <div class="stats">
                    <p><strong>Количество объектов:</strong> ${route.path.length}</p>
                    <p><strong>Обязательные объекты:</strong> ${this.requiredAttractions.size}</p>
                    <p><strong>Длина маршрута:</strong> ${route.distance} м</p>
                    <p><strong>Оставшееся расстояние:</strong> ${maxDistance - route.distance} м</p>
                    <p><strong>Эффективность использования:</strong> ${efficiency}%</p>
                </div>
            </div>
        `;
        
    
    }

    // Показать сообщение
    showMessage(message) {
        document.getElementById('results').innerHTML = `<p>${message}</p>`;
    }

    // Очистка выбора
    clearSelection() {
        this.selectedAttractions.clear();
        this.requiredAttractions.clear();
        this.mapManager.updateSelectedAttractions(this.selectedAttractions);
        this.initAttractionsList();
        this.updateMapMarkers();
        this.mapManager.clearRoute();
        this.showMessage('Выберите достопримечательности и нажмите "Найти оптимальный маршрут"');
    }
}

// Создание и инициализация приложения
const app = new TourismPlannerApp();