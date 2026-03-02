using Microsoft.Data.SqlClient;
using System.Data;

namespace AscendAPI.Services;

/// <summary>
/// Provides SQL Server connections via Microsoft.Data.SqlClient.
/// Registered as singleton - SqlConnection is created per-request via CreateConnection().
/// Includes a SemaphoreSlim to limit concurrent DB operations and prevent pool exhaustion.
/// </summary>
public class DbService
{
    private readonly string _connectionString;

    /// <summary>
    /// Limits concurrent open connections to prevent pool exhaustion when the
    /// React dashboard fires all 17+ metric requests simultaneously.
    /// </summary>
    private readonly SemaphoreSlim _semaphore;

    public DbService(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("IVR2")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:IVR2 in configuration.");

        // Allow up to 20 concurrent DB operations (well within Max Pool Size=200)
        _semaphore = new SemaphoreSlim(20, 20);
    }

    /// <summary>
    /// Create a raw connection (caller manages lifecycle).
    /// </summary>
    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    /// <summary>
    /// Acquire a semaphore slot, then provide a connection.
    /// Returns a wrapper that releases the semaphore on dispose.
    /// </summary>
    public async Task<ThrottledConnection> GetThrottledConnectionAsync(CancellationToken ct = default)
    {
        await _semaphore.WaitAsync(ct);
        try
        {
            var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            return new ThrottledConnection(conn, _semaphore);
        }
        catch
        {
            _semaphore.Release();
            throw;
        }
    }
}

/// <summary>
/// Wraps an open SqlConnection and releases a SemaphoreSlim slot on dispose.
/// </summary>
public sealed class ThrottledConnection : IAsyncDisposable, IDisposable
{
    public SqlConnection Connection { get; }
    private readonly SemaphoreSlim _semaphore;
    private bool _disposed;

    public ThrottledConnection(SqlConnection connection, SemaphoreSlim semaphore)
    {
        Connection = connection;
        _semaphore = semaphore;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        Connection.Dispose();
        _semaphore.Release();
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        _disposed = true;
        await Connection.DisposeAsync();
        _semaphore.Release();
    }
}
