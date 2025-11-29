var builder = WebApplication.CreateBuilder(args);

// Добавляем CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
var app = builder.Build();
app.UseCors("AllowAll"); 

app.UseCors("AllowFrontend");
app.MapControllers();
app.MapGet("/api/route", () => "API работает!");
app.Run();  