using Microsoft.Data.SqlClient;
using System.Data;

namespace AscendAPI.Services;

/// <summary>
/// Provides SQL Server connections via Microsoft.Data.SqlClient.
/// Registered as singleton — SqlConnection is created per-request via CreateConnection().
/// </summary>
public class DbService
{
    private readonly string _connectionString;

    public DbService(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("IVR2")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:IVR2 in configuration.");
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}
