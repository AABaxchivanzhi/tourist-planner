class VologdaAttractionsApp {
    constructor() {
        this.API_BASE = '/api/attractions';
        this.attractions = [];
        this.map = null;
        this.markers = [];
        this.selectedAttraction = null;
        this.currentFilter = { type: 'all', search: '' };
    }

    // Инициализация приложения
    async init() {
        await this.initMap();
        await this.loadAttractions();
        this.setupEventListeners();
    }

    // Инициализация карты
    async initMap() {
        this.map = L.map('map').setView([59.2181, 39.8886], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    // Загрузка достопримечательностей
    async loadAttractions() {
        try {
            const response = await fetch(this.API_BASE);
            const data = await response.json();
            this.attractions = data.attractions;
            this.renderAttractionsList();
            this.addMarkersToMap();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showError('Не удалось загрузить достопримечательности');
        }
    }


    // Выбор достопримечательности из списка
    selectAttractionFromList(attraction) {
        this.clearAllSelections();
        this.selectedAttraction = attraction;

        // Подсветка элемента в списке
        this.highlightListItem(attraction.id);
        
        // Подсветка маркера на карте
        this.highlightMapMarker(attraction.id);
        
        // Центрирование карты на объекте
        this.map.setView([attraction.lat, attraction.lon], 16);
        
        // Открытие попапа
        this.openMarkerPopup(attraction.id);
        
        // Показ детальной информации
        this.showAttractionDetails(attraction);
    }

    // Выбор достопримечательности с карты
    selectAttractionFromMap(attraction) {
        this.clearAllSelections();
        this.selectedAttraction = attraction;

        // Подсветка элемента в списке
        this.highlightListItem(attraction.id);
        
        // Подсветка маркера на карте
        this.highlightMapMarker(attraction.id);
        
        // Прокрутка списка к выбранному элементу
        this.scrollToListItem(attraction.id);
        
        // Показ детальной информации
        this.showAttractionDetails(attraction);
    }

    // Очистка всех выделений
    clearAllSelections() {
        // Снимаем выделение со всех элементов списка
        document.querySelectorAll('.attraction-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Снимаем выделение со всех маркеров
        this.markers.forEach(marker => {
            marker.setIcon(this.getDefaultMarkerIcon());
        });
    }

    // Подсветка элемента в списке
    highlightListItem(attractionId) {
        const items = document.querySelectorAll('.attraction-item');
        items.forEach(item => {
            if (item.dataset.id === attractionId) {
                item.classList.add('selected');
                // Прокручиваем к элементу
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Подсветка маркера на карте
    highlightMapMarker(attractionId) {
        this.markers.forEach(marker => {
            if (marker.attractionId === attractionId) {
                // Устанавливаем выделенный стиль маркера
                marker.setIcon(this.getSelectedMarkerIcon());
            } else {
                // Возвращаем обычный стиль
                marker.setIcon(this.getDefaultMarkerIcon());
            }
        });
    }

    // Прокрутка списка к элементу
    scrollToListItem(attractionId) {
        const item = document.querySelector(`[data-id="${attractionId}"]`);
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Открытие попапа маркера
    openMarkerPopup(attractionId) {
        const marker = this.markers.find(m => m.attractionId === attractionId);
        if (marker) {
            marker.openPopup();
        }
    }


    // Добавление маркеров на карту
    addMarkersToMap() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.attractions.forEach(attraction => {
            const marker = L.marker([attraction.lat, attraction.lon], {
                icon: this.getDefaultMarkerIcon()
            }).addTo(this.map);

            // Создаем содержимое попапа
            const popupContent = this.createPopupContent(attraction);
            marker.bindPopup(popupContent);

            // Сохраняем ID достопримечательности в маркере
            marker.attractionId = attraction.id;

            // Обработчик клика по маркеру
            marker.on('click', () => {
                this.selectAttractionFromMap(attraction);
            });

            this.markers.push(marker);
        });
    }

    // Создание контента для попапа
    createPopupContent(attraction) {
        return `
            <div class="popup-content">
                <h3>${attraction.name}</h3>
                <p><strong>Тип:</strong> ${attraction.type}</p>
                ${attraction.description ? `<p><strong>Описание:</strong> ${attraction.description}</p>` : ''}
                <div class="popup-actions">
                    <button onclick="app.selectAttractionFromListById('${attraction.id}')" 
                            class="popup-btn">
                        📍 Выбрать в списке
                    </button>
                </div>
            </div>
        `;
    }

    // Стиль обычного маркера
    getDefaultMarkerIcon() {
        return L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }

    // Стиль выделенного маркера
    getSelectedMarkerIcon() {
        return L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="41" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 32 16 32s16-16 16-32C32 7.163 24.837 0 16 0z" fill="#2196F3"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                </svg>
            `),
            iconSize: [32, 41],
            iconAnchor: [16, 41],
            popupAnchor: [0, -41]
        });
    }

 
    // Рендеринг списка достопримечательностей
    renderAttractionsList() {
        const list = document.getElementById('attractionsList');
        list.innerHTML = '';

        this.attractions.forEach(attraction => {
            const item = document.createElement('div');
            item.className = 'attraction-item';
            item.dataset.id = attraction.id;

            if (this.selectedAttraction && this.selectedAttraction.id === attraction.id) {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <div class="attraction-content">
                    <div class="attraction-name">${attraction.name}</div>
                    <div class="attraction-type">${attraction.type}</div>
                    <div class="attraction-coords">${attraction.lat.toFixed(4)}, ${attraction.lon.toFixed(4)}</div>
                </div>
                <div class="attraction-actions">
                    <button class="btn-select" onclick="app.selectOnMap('${attraction.id}')">
                        Показать на карте
                    </button>
                </div>
            `;

            // Обработчик клика по элементу списка
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-select')) {
                    this.selectAttractionFromList(attraction);
                }
            });

            list.appendChild(item);
        });
    }

    // Показ детальной информации о достопримечательности
    showAttractionDetails(attraction) {
        // Удаляем предыдущую детальную информацию
        const oldDetails = document.querySelector('.attraction-details');
        if (oldDetails) {
            oldDetails.remove();
        }

        // Создаем новую детальную информацию
        const details = document.createElement('div');
        details.className = 'attraction-details';
        details.innerHTML = `
            <div class="details-header">
                <h3>${attraction.name}</h3>
                <button class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="details-content">
                <div class="detail-item">
                    <span class="detail-label">Тип:</span> ${attraction.type}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Координаты:</span> 
                    ${attraction.lat.toFixed(6)}, ${attraction.lon.toFixed(6)}
                </div>
                ${attraction.description ? `
                <div class="detail-item">
                    <span class="detail-label">Описание:</span> ${attraction.description}
                </div>
                ` : ''}
                ${attraction.opening_hours ? `
                <div class="detail-item">
                    <span class="detail-label">Часы работы:</span> ${attraction.opening_hours}
                </div>
                ` : ''}
                ${attraction.website ? `
                <div class="detail-item">
                    <span class="detail-label">Сайт:</span> 
                    <a href="${attraction.website}" target="_blank">${attraction.website}</a>
                </div>
                ` : ''}
            </div>
            <div class="details-actions">
                <button class="btn-center" onclick="app.centerOnAttraction('${attraction.id}')">
                    📍 Центрировать на карте
                </button>
            </div>
        `;

        // Вставляем в начало списка
        const list = document.getElementById('attractionsList');
        list.insertBefore(details, list.firstChild);
    }


    // Настройка обработчиков событий
    setupEventListeners() {
        // Поиск
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchAttractions(e.target.value);
            }, 300);
        });

        // Фильтры
        const filterButtons = document.getElementById('filterButtons');
        filterButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const type = e.target.dataset.type;
                this.filterByType(type);
            }
        });
    }

    // Поиск достопримечательностей
    async searchAttractions(searchTerm) {
        try {
            const response = await fetch(`${this.API_BASE}/filter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ search: searchTerm })
            });
            const data = await response.json();
            this.attractions = data.attractions;
            this.renderAttractionsList();
            this.addMarkersToMap();
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    // Фильтрация по типу
    async filterByType(type) {
        try {
            const filter = type === 'all' ? {} : { type: type };
            const response = await fetch(`${this.API_BASE}/filter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filter)
            });
            const data = await response.json();
            this.attractions = data.attractions;
            this.renderAttractionsList();
            this.addMarkersToMap();
            
            // Обновляем активную кнопку фильтра
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-type="${type}"]`).classList.add('active');
        } catch (error) {
            console.error('Ошибка фильтрации:', error);
        }
    }


    // Выбор по ID из списка
    selectAttractionFromListById(attractionId) {
        const attraction = this.attractions.find(a => a.id === attractionId);
        if (attraction) {
            this.selectAttractionFromList(attraction);
        }
    }

    // Выбор на карте по ID
    selectOnMap(attractionId) {
        const attraction = this.attractions.find(a => a.id === attractionId);
        if (attraction) {
            this.selectAttractionFromMap(attraction);
        }
    }

    // Центрирование карты на достопримечательности
    centerOnAttraction(attractionId) {
        const attraction = this.attractions.find(a => a.id === attractionId);
        if (attraction) {
            this.map.setView([attraction.lat, attraction.lon], 16);
        }
    }

    // Показать ошибку
    showError(message) {
        const list = document.getElementById('attractionsList');
        list.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Создание и инициализация приложения
const app = new VologdaAttractionsApp();
document.addEventListener('DOMContentLoaded', () => app.init());

// Глобальные функции для вызова из HTML
window.app = app;