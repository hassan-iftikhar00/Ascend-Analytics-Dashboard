using AscendAPI.Services;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace AscendAPI.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    private readonly DbService _db;
    public HealthController(DbService db) => _db = db;

    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        try
        {
            using var conn = _db.CreateConnection();
            var ok = await conn.ExecuteScalarAsync<int>("SELECT 1");
            return Ok(new
            {
                status = "ok",
                db = ok == 1 ? "connected" : "error",
                timestamp = DateTime.UtcNow.ToString("o"),
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "error",
                db = "disconnected",
                error = ex.Message,
            });
        }
    }
}
