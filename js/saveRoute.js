// Менеджер маршрутов для сохранения и загрузки
class RouteManager {
    constructor() {
        this.API_BASE = '/api/routes';
        this.savedRoutes = [];
        this.currentRoute = {
            name: '',
            points: [],
            createdAt: null
        };
    }

    // Инициализация менеджера маршрутов
    async init() {
        await this.loadSavedRoutes();
        this.renderSavedRoutes();
        this.setupEventListeners();
        console.log('RouteManager initialized');
    }

    // Сохранить маршрут из массива точек
    async saveRoute(routeName, points) {
        if (!routeName || routeName.trim() === '') {
            this.showMessage('Введите название маршрута', 'error');
            return false;
        }

        if (!points || points.length === 0) {
            this.showMessage('Маршрут должен содержать точки', 'error');
            return false;
        }

        try {
            const routeData = {
                name: routeName.trim(),
                points: points,
                createdAt: new Date().toISOString()
            };

            const response = await fetch(this.API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(routeData)
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения маршрута');
            }

            const savedRoute = await response.json();
            this.savedRoutes.unshift(savedRoute); // Добавляем в начало
            this.renderSavedRoutes();
            
            this.showMessage(`Маршрут "${routeName}" сохранен!`, 'success');
            return true;

        } catch (error) {
            console.error('Ошибка сохранения маршрута:', error);
            this.showMessage('Ошибка сохранения маршрута', 'error');
            return false;
        }
    }

    // Загрузить сохраненные маршруты с сервера
    async loadSavedRoutes() {
        try {
            const response = await fetch(this.API_BASE);
            if (!response.ok) {
                throw new Error('Ошибка загрузки маршрутов');
            }
            
            this.savedRoutes = await response.json();
            console.log('Загружено маршрутов:', this.savedRoutes.length);
            
        } catch (error) {
            console.error('Ошибка загрузки маршрутов:', error);
            this.savedRoutes = [];
        }
    }

    // Загрузить конкретный маршрут по ID
    async loadRoute(routeId) {
        try {
            const response = await fetch(`${this.API_BASE}/${routeId}`);
            if (!response.ok) {
                throw new Error('Маршрут не найден');
            }
            
            const route = await response.json();
            return route;
            
        } catch (error) {
            console.error('Ошибка загрузки маршрута:', error);
            this.showMessage('Ошибка загрузки маршрута', 'error');
            return null;
        }
    }

    // Удалить маршрут
    async deleteRoute(routeId) {
        if (!confirm('Вы уверены, что хотите удалить этот маршрут?')) {
            return false;
        }

        try {
            const response = await fetch(`${this.API_BASE}/${routeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка удаления маршрута');
            }

            this.savedRoutes = this.savedRoutes.filter(route => route.id !== routeId);
            this.renderSavedRoutes();
            
            this.showMessage('Маршрут удален', 'success');
            return true;

        } catch (error) {
            console.error('Ошибка удаления маршрута:', error);
            this.showMessage('Ошибка удаления маршрута', 'error');
            return false;
        }
    }



    // Добавить точку в текущий маршрут
    addPointToCurrentRoute(point) {
        if (!point || !point.id || !point.name || point.lat === undefined || point.lon === undefined) {
            console.error('Некорректная точка маршрута:', point);
            return false;
        }

        // Проверяем, нет ли уже этой точки в маршруте
        if (this.currentRoute.points.some(p => p.id === point.id)) {
            this.showMessage('Эта точка уже есть в маршруте', 'warning');
            return false;
        }

        this.currentRoute.points.push({
            id: point.id,
            name: point.name,
            lat: point.lat,
            lon: point.lon,
            type: point.type || 'point'
        });

        this.renderCurrentRoute();
        this.showMessage(`Точка "${point.name}" добавлена в маршрут`, 'success');
        return true;
    }

    // Удалить точку из текущего маршрута
    removePointFromCurrentRoute(pointId) {
        this.currentRoute.points = this.currentRoute.points.filter(p => p.id !== pointId);
        this.renderCurrentRoute();
        this.showMessage('Точка удалена из маршрута', 'info');
    }

    // Очистить текущий маршрут
    clearCurrentRoute() {
        this.currentRoute = {
            name: '',
            points: [],
            createdAt: null
        };
        this.renderCurrentRoute();
        this.showMessage('Маршрут очищен', 'info');
    }

    // Сохранить текущий маршрут
    async saveCurrentRoute() {
        if (this.currentRoute.points.length === 0) {
            this.showMessage('Добавьте точки в маршрут перед сохранением', 'warning');
            return false;
        }

        const routeName = prompt('Введите название маршрута:');
        if (!routeName) {
            return false;
        }

        return await this.saveRoute(routeName, this.currentRoute.points);
    }


    // Отображение текущего маршрута
    renderCurrentRoute() {
        const container = document.getElementById('currentRouteContainer');
        if (!container) return;

        if (this.currentRoute.points.length === 0) {
            container.innerHTML = `
                <div class="route-empty">
                    <h4> Текущий маршрут</h4>
                    <p>Точки маршрута не добавлены</p>
                    <p class="hint">Добавляйте точки через кнопку "Добавить в маршрут" на достопримечательностях</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="current-route">
                <h4> Текущий маршрут (${this.currentRoute.points.length} точек)</h4>
                <div class="route-points-list">
        `;

        this.currentRoute.points.forEach((point, index) => {
            html += `
                <div class="route-point-item" data-point-id="${point.id}">
                    <div class="point-number">${index + 1}</div>
                    <div class="point-info">
                        <div class="point-name">${this.escapeHtml(point.name)}</div>
                        <div class="point-coords">${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
                    </div>
                    <div class="point-actions">
                        <button class="btn-remove-point" onclick="routeManager.removePointFromCurrentRoute('${point.id}')" title="Удалить точку">
                            ×
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="route-actions">
                    <button class="btn-save-route" onclick="routeManager.saveCurrentRoute()">
                         Сохранить маршрут
                    </button>
                    <button class="btn-clear-route" onclick="routeManager.clearCurrentRoute()">
                         Очистить
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Отображение сохраненных маршрутов
    renderSavedRoutes() {
        const container = document.getElementById('savedRoutesContainer');
        if (!container) return;

        if (this.savedRoutes.length === 0) {
            container.innerHTML = `
                <div class="saved-routes-empty">
                    <h4> Сохраненные маршруты</h4>
                    <p>Нет сохраненных маршрутов</p>
                </div>
            `;
            return;
        }

        let html = `
            <div clas="saved-routes">
                <h4> Сохраненные маршруты</h4>
                <div class="saved-routes-list">
        `;

        this.savedRoutes.forEach(route => {
            const date = new Date(route.createdAt).toLocaleDateString('ru-RU');
            html += `
                <div class="saved-route-item" data-route-id="${route.id}">
                    <div class="route-header">
                        <div class="route-name">${this.escapeHtml(route.name)}</div>
                        <div class="route-meta">
                            ${route.points.length} точек • ${date}
                        </div>
                    </div>
                    <div class="route-points-preview">
                        ${route.points.slice(0, 3).map((point, index) => `
                            <div class="preview-point">${index + 1}. ${this.escapeHtml(point.name)}</div>
                        `).join('')}
                        ${route.points.length > 3 ? `<div class="preview-more">... и еще ${route.points.length - 3} точек</div>` : ''}
                    </div>
                    <div class="route-actions">
                        <button class="btn-load-route" onclick="routeManager.onLoadRoute('${route.id}')" title="Загрузить маршрут">
                             Загрузить
                        </button>
                        <button class="btn-delete-route" onclick="routeManager.onDeleteRoute('${route.id}')" title="Удалить маршрут">
                             Удалить
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    setupEventListeners() {
        // Глобальные обработчики для кнопок добавления в маршрут
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-route-btn')) {
                const attractionId = e.target.dataset.attractionId;
                this.onAddAttractionToRoute(attractionId);
            }
        });

        // Обработчики для загрузки маршрутов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('load-route-external')) {
                const routeId = e.target.dataset.routeId;
                this.onLoadRoute(routeId);
            }
        });
    }

    // Обработчик добавления достопримечательности в маршрут
    onAddAttractionToRoute(attractionId) {
        // Этот метод должен быть реализован в основном приложении
        if (window.app && window.app.getAttractionById) {
            const attraction = window.app.getAttractionById(attractionId);
            if (attraction) {
                this.addPointToCurrentRoute(attraction);
            }
        } else {
            console.warn('Метод getAttractionById не найден в основном приложении');
        }
    }

    // Обработчик загрузки маршрута
    async onLoadRoute(routeId) {
        const route = await this.loadRoute(routeId);
        if (route) {
            // Вызываем событие загрузки маршрута для основного приложения
            this.dispatchRouteLoadedEvent(route);
            this.showMessage(`Маршрут "${route.name}" загружен`, 'success');
        }
    }

    // Обработчик удаления маршрута
    async onDeleteRoute(routeId) {
        await this.deleteRoute(routeId);
    }


    // Создать событие загрузки маршрута
    dispatchRouteLoadedEvent(route) {
        const event = new CustomEvent('routeLoaded', {
            detail: { route }
        });
        document.dispatchEvent(event);
    }

    // Внешний метод для добавления точки в маршрут
    addPoint(point) {
        return this.addPointToCurrentRoute(point);
    }

    // Внешний метод для получения текущего маршрута
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Внешний метод для получения сохраненных маршрутов
    getSavedRoutes() {
        return this.savedRoutes;
    }

    // Показать сообщение
    showMessage(message, type = 'info') {
        // Создаем элемент сообщения
        const messageEl = document.createElement('div');
        messageEl.className = `route-message route-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(messageEl);
    }

    // Экранирование HTML
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Создаем глобальный экземпляр менеджера маршрутов
const routeManager = new RouteManager();

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    routeManager.init();
});

// Экспортируем для глобального использования
window.routeManager = routeManager;