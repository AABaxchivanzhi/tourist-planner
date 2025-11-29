// Модуль для работы с картой
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.routeLayer = null;
        this.selectedAttractions = new Set();
    }

    // Инициализация карты
    initMap() {
        this.map = L.map('map').setView([59.216, 39.8840], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        return this.map;
    }

    // Добавление маркеров на карту
    addMarkers(attractions, onMarkerClick) {
        this.clearMarkers();
        
        attractions.forEach(attraction => {
            const isSelected = this.selectedAttractions.has(attraction.id);
            
            const marker = L.marker([attraction.lat, attraction.lng])
                .addTo(this.map)
                .bindPopup(`
                    <b>${attraction.name}</b><br>
                    <button onclick="app.toggleAttraction(${attraction.id})">
                        ${isSelected ? 'Убрать из выбора' : 'Выбрать'}
                    </button>
                `);
            
            if (isSelected) {
                this.setSelectedMarkerStyle(marker);
            }
            
            marker.on('click', () => {
                onMarkerClick(attraction.id);
            });
            
            this.markers.push(marker);
        });
    }

    // Установка стиля для выбранного маркера
    setSelectedMarkerStyle(marker) {
        marker.setIcon(
            L.divIcon({
                className: 'selected-marker',
                html: '<div style="background-color: #3498db; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        );
    }

    // Очистка всех маркеров
    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    // Отображение маршрута на карте
    displayRoute(route, attractions) {
        this.clearRoute();
        
        if (route.path.length === 0) {
            return;
        }
        
        const latlngs = route.path.map(id => [attractions[id].lat, attractions[id].lng]);
        
        this.routeLayer = L.polyline(latlngs, {
            color: 'red', 
            weight: 5, 
            opacity: 0.7
        }).addTo(this.map);
        
        // Добавляем нумерацию точек маршрута
        route.path.forEach((id, index) => {
            L.marker([attractions[id].lat, attractions[id].lng])
                .addTo(this.map)
                .bindPopup(`<b>${index + 1}. ${attractions[id].name}</b>`);
        });
        
        this.map.fitBounds(this.routeLayer.getBounds());
    }

    // Очистка маршрута
    clearRoute() {
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
    }

    // Обновление выбранных достопримечательностей
    updateSelectedAttractions(selectedIds) {
        this.selectedAttractions = new Set(selectedIds);
    }
}