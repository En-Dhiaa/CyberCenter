using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;

    public AuditLogsController(InMemoryDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    [HttpGet]
    public ActionResult<object> GetAuditLogs(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _dataStore.AuditLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(l =>
                l.Action.ToLowerInvariant().Contains(s) ||
                l.Username.ToLowerInvariant().Contains(s) ||
                l.EntityName.ToLowerInvariant().Contains(s) ||
                (l.EntityId != null && l.EntityId.ToLowerInvariant().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(l => l.Action.Equals(action, StringComparison.OrdinalIgnoreCase));
        }

        var totalItems = query.Count();
        var items = query
            .OrderByDescending(l => l.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new
        {
            total = totalItems,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            items
        });
    }
}

