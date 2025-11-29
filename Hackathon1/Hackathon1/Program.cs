using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int PointNumber = int.Parse(Console.ReadLine()); // кол-во точек
        int MaxLength = int.Parse(Console.ReadLine()); // максимальная длина

        int[,] Matrix = new int[PointNumber, PointNumber]; // заполнение матрицы смежности
        for (int i = 0; i < PointNumber; i++)
        {
            string[] row = Console.ReadLine().Split();
            for (int j = 0; j < PointNumber; j++)
            {
                Matrix[i, j] = int.Parse(row[j]);
            }
        }

         
        int size = 1 << PointNumber; // двоично на 1 больше, чем заполненная маска
        int[,] Ways = new int[size, PointNumber];           // массивы для минимальной длины пути к маске
        int[,] PreviousPoints = new int[size, PointNumber]; // и пути к маске

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
                    int newLength = Ways[mask, last] + Matrix[last, next];

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
    }
    /// <summary>
    /// кол-во единиц (посещенных мест)
    /// </summary>
    /// <param name="n">маска</param>
    /// <returns></returns>
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