using AscendAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──
builder.Services.AddSingleton<DbService>();
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Match JS behaviour: camelCase property names
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddOpenApi();

var app = builder.Build();

// ── Middleware ──
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Request logging (dev)
if (app.Environment.IsDevelopment())
{
    app.Use(async (ctx, next) =>
    {
        Console.WriteLine($"{ctx.Request.Method} {ctx.Request.Path}{ctx.Request.QueryString}");
        await next();
    });
}

app.MapControllers();

// ── Run on port 5000 to match Vite proxy ──
app.Run("http://0.0.0.0:5000");

