namespace BackEnd
{
    public class Attraction
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    public class Data
    {
        public static List<Attraction> Attractions = new List<Attraction>
        {
            new Attraction { Id = 0, Name = "Краеведческий музей заповедник", Lat = 59.2236047, Lng = 39.8815831 },
            new Attraction { Id = 1, Name = "Галерея Красный мост", Lat = 59.2218485, Lng = 39.8951011 },
            new Attraction { Id = 2, Name = "Церковь Варлаама Хутынского", Lat = 59.2201563, Lng = 39.8847294 },
            new Attraction { Id = 3, Name = "Софийский собор", Lat = 59.2217892, Lng = 39.8839947 },
            new Attraction { Id = 4, Name = "Памятник букве О", Lat = 59.224697, Lng = 39.88406 },
            new Attraction { Id = 5, Name = "Памятник К.Н. Батюшкову", Lat = 59.2198341, Lng = 39.8916728 },
            new Attraction { Id = 6, Name = "Дом Петра I", Lat = 59.2224561, Lng = 39.8843926 },
            new Attraction { Id = 7, Name = "Вологодский Кремль", Lat = 59.2208945, Lng = 39.8821673 },
            new Attraction { Id = 8, Name = "Вологодский драматический театр", Lat = 59.2178934, Lng = 39.8894562 }
        };

        public static int[][] DistanceMatrix = new int[][]
        {
            new int[] {0, 950, 400, 250, 1200, 1100, 150, 350, 1400},
            new int[] {950, 0, 800, 850, 350, 450, 900, 900, 650},
            new int[] {400, 800, 0, 200, 850, 750, 300, 250, 1000},
            new int[] {250, 850, 200, 0, 950, 850, 200, 150, 1150},
            new int[] {1200, 350, 850, 950, 0, 150, 1150, 1050, 300},
            new int[] {1100, 450, 750, 850, 150, 0, 1050, 950, 450},
            new int[] {150, 900, 300, 200, 1150, 1050, 0, 250, 1300},
            new int[] {350, 900, 250, 150, 1050, 950, 250, 0, 1200},
            new int[] {1400, 650, 1000, 1150, 300, 450, 1300, 1200, 0}
        };
    }
}