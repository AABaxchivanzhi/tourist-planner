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

        // Используем улучшенный жадный алгоритм с несколькими стартовыми точками
        let bestRoute = { path: [], distance: Infinity };
        
        // Пробуем начать с каждой точки
        for (let startId of selectedIds) {
            const route = this.buildGreedyRoute(selectedIds, startId, maxDistance);
            
            if (route.path.length > bestRoute.path.length || 
                (route.path.length === bestRoute.path.length && route.distance < bestRoute.distance)) {
                bestRoute = route;
            }
        }
        
        return bestRoute;
    }

    // Построение маршрута жадным алгоритмом
    buildGreedyRoute(selectedIds, startId, maxDistance) {
        const path = [startId];
        let totalDistance = 0;
        const visited = new Set([startId]);
        let current = startId;
        
        while (visited.size < selectedIds.length) {
            let next = -1;
            let minDist = Infinity;
            
            for (let id of selectedIds) {
                if (!visited.has(id)) {
                    const dist = this.distanceMatrix[current][id];
                    if (dist < minDist && totalDistance + dist <= maxDistance) {
                        minDist = dist;
                        next = id;
                    }
                }
            }
            
            if (next === -1) break;
            
            path.push(next);
            totalDistance += minDist;
            visited.add(next);
            current = next;
        }
        
        return { path, distance: totalDistance };
    }

    // Альтернативный алгоритм (можно использовать для сравнения)
    findAlternativeRoute(selectedIds, maxDistance) {
        // Более сложный алгоритм можно реализовать здесь
        // Например, метод ветвей и границ или генетический алгоритм
        return this.findOptimalRoute(selectedIds, maxDistance);
    }
}