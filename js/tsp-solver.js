// Алгоритм динамического программирования для задачи коммивояжера
class TSPSolver {
    constructor(distanceMatrix, maxLength) {
        this.distanceMatrix = distanceMatrix;
        this.maxLength = maxLength;
        this.pointNumber = distanceMatrix.length;
        this.size = 1 << this.pointNumber;
        
        this.ways = null;
        this.previousPoints = null;
    }

    // Подсчет количества битов в числе
    countBits(n) {
        let count = 0;
        while (n > 0) {
            count += n & 1;
            n >>= 1;
        }
        return count;
    }

    // Поиск оптимального маршрута
    findOptimalRoute() {
        // Инициализация массивов для динамического программирования
        this.ways = new Array(this.size);
        this.previousPoints = new Array(this.size);
        
        for (let i = 0; i < this.size; i++) {
            this.ways[i] = new Array(this.pointNumber).fill(Number.MAX_SAFE_INTEGER);
            this.previousPoints[i] = new Array(this.pointNumber).fill(-1);
        }

        // Заполнение начальных состояний
        for (let i = 0; i < this.pointNumber; i++) {
            this.ways[1 << i][i] = 0;
            this.previousPoints[1 << i][i] = -1;
        }

        // Динамическое программирование
        for (let mask = 0; mask < this.size; mask++) {
            for (let last = 0; last < this.pointNumber; last++) {
                if (this.ways[mask][last] === Number.MAX_SAFE_INTEGER) continue;

                for (let next = 0; next < this.pointNumber; next++) {
                    if ((mask & (1 << next)) !== 0) continue;

                    const newMask = mask | (1 << next);
                    const newLength = this.ways[mask][last] + this.distanceMatrix[last][next];

                    if (newLength <= this.maxLength && newLength < this.ways[newMask][next]) {
                        this.ways[newMask][next] = newLength;
                        this.previousPoints[newMask][next] = last;
                    }
                }
            }
        }

        // Поиск лучшего маршрута - сначала по количеству точек, затем по минимальной длине
        let bestMask = -1;
        let bestLast = -1;
        let bestCount = -1;
        let bestLength = Number.MAX_SAFE_INTEGER;

        // Сначала ищем маршруты с максимальным количеством точек
        for (let mask = 0; mask < this.size; mask++) {
            for (let last = 0; last < this.pointNumber; last++) {
                if (this.ways[mask][last] > this.maxLength) continue;

                const count = this.countBits(mask);
                
                // Если нашли маршрут с большим количеством точек
                if (count > bestCount) {
                    bestCount = count;
                    bestLength = this.ways[mask][last];
                    bestMask = mask;
                    bestLast = last;
                }
                // Если количество точек одинаковое, выбираем с меньшей длиной
                else if (count === bestCount && this.ways[mask][last] < bestLength) {
                    bestLength = this.ways[mask][last];
                    bestMask = mask;
                    bestLast = last;
                }
            }
        }

        // Если не нашли маршрут с максимальным количеством точек, ищем любой допустимый
        if (bestMask === -1) {
            for (let mask = 0; mask < this.size; mask++) {
                for (let last = 0; last < this.pointNumber; last++) {
                    if (this.ways[mask][last] <= this.maxLength && this.ways[mask][last] < bestLength) {
                        bestLength = this.ways[mask][last];
                        bestMask = mask;
                        bestLast = last;
                        bestCount = this.countBits(mask);
                    }
                }
            }
        }

        // Восстановление пути
        return this.reconstructPath(bestMask, bestLast, bestLength);
    }

    // Восстановление пути из динамической таблицы
    reconstructPath(bestMask, bestLast, bestLength) {
        if (bestMask === -1) {
            return { path: [], distance: 0 };
        }

        const path = [];
        let current = bestLast;
        let currentMask = bestMask;

        while (current !== -1) {
            path.push(current);
            const prevVertex = this.previousPoints[currentMask][current];
            currentMask &= ~(1 << current);
            current = prevVertex;
        }

        return {
            path: path.reverse(),
            distance: bestLength
        };
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TSPSolver;
}