using BackEnd;
using Microsoft.AspNetCore.Mvc;
using System.IO;

[ApiController]
[Route("api/[controller]")]
public class RouteController : ControllerBase
{
    public List<SavedRoute> SavedRoutes { get; set; } = new List<SavedRoute>();
    [HttpPost("getroute")]
    public IActionResult GetRoute(int i)
    {
        if (i < 0 || i >= SavedRoutes.Count)  // ← проверка
        {
            return NotFound($"Маршрут с индексом {i} не найден"); ;
        }
            var route = SavedRoutes[i];
        var result = new
        {
            count = route.count,
            path = route.path,
            distance = route.distance
        };

        return Ok(result);
    }

    [HttpPost("calculate")]
    public IActionResult CalculateRoute([FromBody] RouteRequest request)
    {
        int PointNumber = request.N;  // ← брать из request
        int MaxLength = request.D;    // ← брать из request

        int[][] Matrix = Data.DistanceMatrix;

        int size = 1 << PointNumber;
        int[,] Ways = new int[size, PointNumber];
        int[,] PreviousPoints = new int[size, PointNumber];

        for (int i = 0; i < size; i++)
            for (int j = 0; j < PointNumber; j++)
                Ways[i, j] = int.MaxValue;


        // заполнение начал пути
        for (int i = 0; i < PointNumber; i++)
        {
            Ways[1 << i, i] = 0;
            PreviousPoints[1 << i, i] = -1;
        }

        // заполнение путей
        for (int mask = 0; mask < size; mask++)
        {
            for (int last = 0; last < PointNumber; last++)
            {
                if (Ways[mask, last] == int.MaxValue) continue; // ненужные данные в массиве путей

                for (int next = 0; next < PointNumber; next++)
                {
                    if ((mask & (1 << next)) != 0) continue; // уже есть в маске

                    int newMask = mask | (1 << next); // задается новая маска через ИЛИ: 1001 ИЛИ 0010 = 1011
                    int newLength = Ways[mask, last] + Matrix[last][next];

                    if (newLength <= MaxLength && newLength < Ways[newMask, next])
                    {
                        Ways[newMask, next] = newLength;
                        PreviousPoints[newMask, next] = last; // заполняются данные в массивах
                    }
                }
            }
        }

        // поиск лучшего пути
        int bestCount = -1;
        int bestLength = int.MaxValue;
        int bestMask = -1;
        int bestLast = -1;

        for (int mask = 0; mask < size; mask++)
        {
            for (int last = 0; last < PointNumber; last++)
            {
                if (Ways[mask, last] > MaxLength) continue;

                int count = CountBits(mask);
                if (count > bestCount || (count == bestCount && Ways[mask, last] < bestLength)) // лучшее число или лучшее число и длина
                {
                    bestCount = count;
                    bestLength = Ways[mask, last];
                    bestMask = mask;
                    bestLast = last;
                }
            }
        }


        List<int> path = new List<int>();
        int current = bestLast;
        int currentMask = bestMask;

        while (current != -1)
        {
            path.Add(current);
            int prevVertex = PreviousPoints[currentMask, current]; // путь берётся по вершине из массива
            currentMask &= ~(1 << current); // убирается вершина из маски
            current = prevVertex;
        }

        path.Reverse();

        Console.WriteLine(path.Count);
        Console.WriteLine(string.Join(" ", path));
        Console.WriteLine($"🔍 Алгоритм: N={request.N}, D={request.D}");
        Console.WriteLine($"🔍 Результат: {path.Count} точек, длина {bestLength}");
        SavedRoute newRoute = new();
        newRoute.count = path.Count;
        newRoute.path = path.ToArray();
        newRoute.distance = bestLength;
        SavedRoutes.Add(newRoute);
        var result = new
        {
            count = path.Count,
            path = path.ToArray(),
            distance = bestLength
        };

        return Ok(result);
    }

    
    static int CountBits(int n)
    {
        int count = 0;
        while (n > 0)
        {
            count += n & 1;
            n >>= 1;
        }
        return count;
    }

}

public class SavedRoute {
    public int count;
    public int distance;
    public int[] path;
}

public class RouteRequest
{
    public int N { get; set; }
    public int D { get; set; }
}

