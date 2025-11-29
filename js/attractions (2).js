/**
 * Рассчитывает расстояние между двумя точками на Земле по формуле гаверсинуса
 * @param {number} lat1 - Широта первой точки
 * @param {number} lon1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lon2 - Долгота второй точки
 * @returns {number} Расстояние в километрах
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в километрах
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Создает матрицу расстояний между всеми точками
 * @param {Array} points - Массив объектов с полями lat и lon
 * @returns {Array} Матрица расстояний (2D массив)
 */
function createDistanceMatrix(points) {
    const n = points.length;
    const matrix = [];
    
    // Проверка входных данных
    if (!Array.isArray(points)) {
        throw new Error('Входные данные должны быть массивом');
    }
    
    if (n === 0) {
        return [];
    }
    
    // Проверка структуры объектов
    points.forEach((point, index) => {
        if (typeof point.lat === 'undefined' || typeof point.lon === 'undefined') {
            throw new Error(`Объект с индексом ${index} не содержит полей lat и lon`);
        }
        if (typeof point.lat !== 'number' || typeof point.lon !== 'number') {
            throw new Error(`Поля lat и lon объекта с индексом ${index} должны быть числами`);
        }
    });
    
    // Заполнение матрицы
    for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                matrix[i][j] = 0; // Расстояние до самой себя равно 0
            } else {
                matrix[i][j] = calculateDistance(
                    points[i].lat, points[i].lon,
                    points[j].lat, points[j].lon
                );
            }
        }
    }
    
    return matrix;
}

// Альтернативная версия с кэшированием для оптимизации
function createDistanceMatrixOptimized(points) {
    const n = points.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    // Предварительно конвертируем координаты в радианы
    const pointsRad = points.map(point => ({
        lat: point.lat * Math.PI / 180,
        lon: point.lon * Math.PI / 180
    }));
    
    const R = 6371;
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dLat = pointsRad[j].lat - pointsRad[i].lat;
            const dLon = pointsRad[j].lon - pointsRad[i].lon;
            
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(pointsRad[i].lat) * Math.cos(pointsRad[j].lat) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
            const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            matrix[i][j] = distance;
            matrix[j][i] = distance; // Матрица симметрична
        }
    }
    
    return matrix;
}