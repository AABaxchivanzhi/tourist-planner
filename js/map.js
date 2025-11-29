// Модуль для работы с картой
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.routeLayer = null;
        this.selectedAttractions = new Set();
        this.drawnItems = new L.FeatureGroup();
        this.isDrawing = false;
        this.polygonLayer = null;
        this.polygonPoints = [];
    }

    // Инициализация карты
    initMap() {
        this.map = L.map('map').setView([59.216, 39.8840], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Добавляем слой для рисования
        this.drawnItems.addTo(this.map);
        this.initDrawingControls();
        
        return this.map;
    }

    // Инициализация элементов управления рисованием
    initDrawingControls() {
        // Создаем кастомные контролы для рисования
        const drawControl = L.control({ position: 'topright' });
        
        drawControl.onAdd = (map) => {
            const div = L.DomUtil.create('div', 'drawing-controls');
            div.innerHTML = `
                <div class="drawing-buttons">
                    <button id="drawPolygon" class="draw-btn" title="Нарисовать многоугольник">
                        ⬢ Выделить область
                    </button>
                    <button id="clearDrawing" class="draw-btn clear-btn" title="Очистить выделение">
                        ✕ Очистить
                    </button>
                </div>
                <div class="drawing-instruction" id="drawingInstruction" style="display: none;">
                    <small>Кликайте по карте для создания вершин. Завершите двойным кликом.</small>
                </div>
            `;
            
            // Предотвращаем закрытие карты при клике на кнопки
            L.DomEvent.disableClickPropagation(div);
            
            return div;
        };
        
        drawControl.addTo(this.map);
        
        // Добавляем обработчики для кнопок
        setTimeout(() => {
            document.getElementById('drawPolygon').addEventListener('click', () => {
                this.startDrawing();
            });
            
            document.getElementById('clearDrawing').addEventListener('click', () => {
                this.clearDrawing();
            });
        }, 100);
    }

    // Начать рисование многоугольника
    startDrawing() {
        if (this.isDrawing) return;
        
        this.isDrawing = true;
        this.polygonPoints = [];
        
        // Показываем инструкцию
        document.getElementById('drawingInstruction').style.display = 'block';
        
        // Включаем режим рисования
        this.map.doubleClickZoom.disable();
        this.map.on('click', this.handleMapClick.bind(this));
        this.map.on('dblclick', this.finishDrawing.bind(this));
        
        // Создаем временный слой для многоугольника
        this.polygonLayer = L.polygon([], {
            color: '#3498db',
            weight: 3,
            fillColor: '#3498db',
            fillOpacity: 0.3,
            dashArray: '5, 5'
        }).addTo(this.map);
        
        // Меняем курсор
        this.map.getContainer().style.cursor = 'crosshair';
        
        console.log('Начато рисование многоугольника');
    }

    // Обработчик кликов по карте при рисовании
    handleMapClick(e) {
        if (!this.isDrawing || !this.polygonLayer) return;
        
        const latlng = e.latlng;
        this.polygonPoints.push(latlng);
        
        // Обновляем многоугольник
        this.polygonLayer.setLatLngs([this.polygonPoints]);
        
        console.log('Добавлена вершина:', latlng);
    }

    // Завершить рисование
    finishDrawing(e) {
        if (!this.isDrawing || !this.polygonLayer || this.polygonPoints.length < 3) {
            this.clearDrawing();
            return;
        }
        
        this.isDrawing = false;
        
        // Скрываем инструкцию
        document.getElementById('drawingInstruction').style.display = 'none';
        
        // Восстанавливаем нормальный режим карты
        this.map.doubleClickZoom.enable();
        this.map.off('click', this.handleMapClick.bind(this));
        this.map.off('dblclick', this.finishDrawing.bind(this));
        this.map.getContainer().style.cursor = '';
        
        // Создаем постоянный многоугольник
        const permanentPolygon = L.polygon([this.polygonPoints], {
            color: '#3498db',
            weight: 3,
            fillColor: '#3498db',
            fillOpacity: 0.2
        }).addTo(this.drawnItems);
        
        // Добавляем попап с информацией
        permanentPolygon.bindPopup(`
            <div style="text-align: center;">
                <b>Выделенная область</b><br>
                <small>${this.polygonPoints.length} вершин</small><br>
                <button onclick="app.mapManager.selectAttractionsInDrawnPolygon()" 
                        style="margin-top: 5px; padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Выбрать объекты внутри
                </button>
            </div>
        `).openPopup();
        
        // Находим достопримечательности внутри многоугольника
        this.selectAttractionsInPolygon(this.polygonPoints);
        
        // Удаляем временный слой
        this.map.removeLayer(this.polygonLayer);
        this.polygonLayer = null;
        this.polygonPoints = [];
        
        console.log('Рисование завершено');
    }

    // Выбрать достопримечательности в нарисованном многоугольнике
    selectAttractionsInDrawnPolygon() {
        const polygons = this.drawnItems.getLayers();
        if (polygons.length > 0) {
            const polygon = polygons[0];
            const latLngs = polygon.getLatLngs()[0];
            this.selectAttractionsInPolygon(latLngs);
        }
    }

    // Выбрать достопримечательности внутри многоугольника
    selectAttractionsInPolygon(polygon) {
        const selectedIds = [];
        
        attractions.forEach(attraction => {
            const point = L.latLng(attraction.lat, attraction.lng);
            if (this.isPointInPolygon(point, polygon)) {
                selectedIds.push(attraction.id);
            }
        });
        
    //     console.log('Выбрано объектов в многоугольнике:', selectedIds.length, selectedIds);
        
        // Обновляем выбор
        if (typeof app !== 'undefined' && selectedIds.length > 0) {
            app.setSelectedAttractions(selectedIds);
            
        }
     }

    // Проверка, находится ли точка внутри многоугольника 
    isPointInPolygon(point, polygon) {
        let inside = false;
        const x = point.lng, y = point.lat;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lng, yi = polygon[i].lat;
            const xj = polygon[j].lng, yj = polygon[j].lat;
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }

    // Очистить рисование
    clearDrawing() {
        this.drawnItems.clearLayers();
        if (this.polygonLayer) {
            this.map.removeLayer(this.polygonLayer);
            this.polygonLayer = null;
        }
        this.isDrawing = false;
        this.polygonPoints = [];
        
        // Восстанавливаем нормальный режим карты
        this.map.doubleClickZoom.enable();
        this.map.off('click', this.handleMapClick.bind(this));
        this.map.off('dblclick', this.finishDrawing.bind(this));
        this.map.getContainer().style.cursor = '';
        
        // Скрываем инструкцию
        document.getElementById('drawingInstruction').style.display = 'none';
        clearMarkers();
        console.log('Рисование очищено');
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
                html: '<div style="background-color: #3498db; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white"></div>',
                iconSize: [16, 16],
                // iconAnchor: [8, 8]
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