// Модуль для планирования маршрутов
class RoutePlanner {
    constructor(attractions, distanceMatrix) {
        this.attractions = attractions;
        this.distanceMatrix = distanceMatrix;
    }

    // Основной алгоритм поиска оптимального маршрута
    findOptimalRoute(selectedIds, maxDistance) {
        if (selectedIds.length === 0) {
            return { path: [], distance: 0 };
        }

        // Если выбрана только одна точка
        if (selectedIds.length === 1) {
            return { path: selectedIds, distance: 0 };
        }

        // Используем точный алгоритм динамического программирования
        return this.findOptimalRouteExact(selectedIds, maxDistance);
    }

    // Точный алгоритм с динамическим программированием
    findOptimalRouteExact(selectedIds, maxDistance) {
        // Создаем подматрицу расстояний для выбранных точек
        const subMatrix = this.createSubMatrix(selectedIds);
        
        const solver = new TSPSolver(subMatrix, maxDistance);
        const result = solver.findOptimalRoute();
        
        // Преобразуем индексы обратно в исходные ID
        const path = result.path.map(idx => selectedIds[idx]);
        
        // Пересчитываем длину маршрута по исходной матрице расстояний
        const actualDistance = this.calculateActualDistance(path);
        
        return { 
            path: path, 
            distance: actualDistance 
        };
    }

    // Создание подматрицы расстояний для выбранных точек
    createSubMatrix(selectedIds) {
        const n = selectedIds.length;
        const subMatrix = new Array(n);
        
        for (let i = 0; i < n; i++) {
            subMatrix[i] = new Array(n);
            for (let j = 0; j < n; j++) {
                subMatrix[i][j] = this.distanceMatrix[selectedIds[i]][selectedIds[j]];
            }
        }
        
        return subMatrix;
    }

    // Расчет длины маршрута по исходной матрице расстояний
    calculateActualDistance(path) {
        let distance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            distance += this.distanceMatrix[path[i]][path[i + 1]];
        }
        return distance;
    }
}