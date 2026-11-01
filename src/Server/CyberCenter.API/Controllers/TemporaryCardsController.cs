using System.Text;
using CyberCenter.Application.Services;
using CyberCenter.Contracts.DTOs;
using CyberCenter.Contracts.Enums;
using CyberCenter.Domain.Entities;
using CyberCenter.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace CyberCenter.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TemporaryCardsController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<TemporaryCardsController> _logger;

    public TemporaryCardsController(InMemoryDataStore dataStore, ILogger<TemporaryCardsController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("batches")]
    public ActionResult<IEnumerable<CardBatchDetailsDto>> GetBatches()
    {
        var batches = _dataStore.CardBatches.Values
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(b =>
            {
                var cards = _dataStore.TemporaryCards.Values.Where(c => c.BatchId == b.Id).ToList();
                var used = cards.Count(c => c.Status != TemporaryCardStatus.Unused);
                return new CardBatchDetailsDto(
                    Id: b.Id,
                    BatchName: b.BatchName,
                    CardCount: b.CardCount,
                    DurationMinutes: b.DurationMinutes,
                    PricePerCard: b.Price,
                    TotalValue: b.Price * b.CardCount,
                    UsedCardsCount: used,
                    ExpiresAtUtc: b.ExpiresAtUtc,
                    CreatedAtUtc: b.CreatedAtUtc
                );
            }).ToList();

        return Ok(batches);
    }

    [HttpGet("batches/{id:guid}/cards")]
    public ActionResult<IEnumerable<TemporaryCardDetailsDto>> GetBatchCards(Guid id)
    {
        var cards = _dataStore.TemporaryCards.Values
            .Where(c => c.BatchId == id)
            .OrderBy(c => c.CardCodeMasked)
            .Select(c => new TemporaryCardDetailsDto(
                Id: c.Id,
                BatchId: c.BatchId,
                CardCodeMasked: c.CardCodeMasked,
                TotalDurationMinutes: c.TotalDurationSeconds / 60,
                RemainingMinutes: c.RemainingSeconds / 60,
                Status: c.Status.ToString(),
                ExpiresAtUtc: c.ExpiresAtUtc,
                FirstUsedAtUtc: c.FirstUsedAtUtc
            )).ToList();

        return Ok(cards);
    }

    [HttpPost("batches")]
    public ActionResult<GenerateCardBatchResponseDto> GenerateCardBatch([FromBody] GenerateCardBatchRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.BatchName) || request.CardCount <= 0 || request.DurationMinutes <= 0)
        {
            return BadRequest(new { message = "يرجى إدخال اسم الدفعة وعدد الكروت والمدة الزمنية بصورة صحيحة." });
        }

        var batchId = Guid.NewGuid();
        var expiresAtUtc = DateTime.UtcNow.AddDays(request.ValidDays);

        var batch = new CardBatch
        {
            Id = batchId,
            BatchName = request.BatchName.Trim(),
            CardCount = request.CardCount,
            DurationMinutes = request.DurationMinutes,
            Price = request.PricePerCard,
            ExpiresAtUtc = expiresAtUtc,
            CreatedByUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"), // SuperAdmin
            CreatedAtUtc = DateTime.UtcNow
        };

        _dataStore.CardBatches.TryAdd(batch.Id, batch);

        var salt = batchId.ToString("N");
        var generatedCardsSummary = new List<GeneratedCardPinDto>();

        for (int i = 1; i <= request.CardCount; i++)
        {
            var rawPin = TemporaryCardSecurity.Generate16DigitPin();
            var maskedCode = TemporaryCardSecurity.MaskPin(rawPin);
            var pinHash = TemporaryCardSecurity.HashPin(rawPin, salt);

            var card = new TemporaryCard
            {
                Id = Guid.NewGuid(),
                BatchId = batch.Id,
                CardCodeMasked = maskedCode,
                PinHash = pinHash,
                TotalDurationSeconds = request.DurationMinutes * 60,
                RemainingSeconds = request.DurationMinutes * 60,
                Status = TemporaryCardStatus.Unused,
                ExpiresAtUtc = expiresAtUtc,
                CreatedAtUtc = DateTime.UtcNow
            };

            _dataStore.TemporaryCards.TryAdd(card.Id, card);

            // Keep cleartext PIN ONLY in this instant generation response so operator can print/save immediately!
            generatedCardsSummary.Add(new GeneratedCardPinDto(
                CardId: card.Id,
                MaskedCode: maskedCode,
                CleartextPin: rawPin,
                DurationMinutes: request.DurationMinutes,
                Price: request.PricePerCard,
                ExpiresAtUtc: expiresAtUtc
            ));
        }

        _dataStore.AuditLogs.Add(new AuditLog
        {
            Action = "GenerateTemporaryCardBatch",
            EntityName = "CardBatch",
            EntityId = batch.Id.ToString(),
            Username = "SuperAdmin",
            AfterStateJson = $"{{\"batch\":\"{batch.BatchName}\",\"count\":{batch.CardCount},\"durationMin\":{batch.DurationMinutes}}}",
            CreatedAtUtc = DateTime.UtcNow
        });

        _logger.LogInformation("Generated Card Batch '{BatchName}' with {Count} cards (Duration: {Duration}m).",
            batch.BatchName, batch.CardCount, batch.DurationMinutes);

        return Ok(new GenerateCardBatchResponseDto(
            BatchId: batch.Id,
            BatchName: batch.BatchName,
            CardsGenerated: request.CardCount,
            PrintableCards: generatedCardsSummary
        ));
    }

    [HttpGet("batches/{id:guid}/export-csv")]
    public IActionResult ExportBatchCsv(Guid id)
    {
        if (!_dataStore.CardBatches.TryGetValue(id, out var batch))
        {
            return NotFound(new { message = "الدفعة غير موجودة." });
        }

        var cards = _dataStore.TemporaryCards.Values.Where(c => c.BatchId == id).ToList();

        var sb = new StringBuilder();
        sb.AppendLine("CardId,CardCode,DurationMinutes,RemainingMinutes,Status,ExpiresAtUtc");

        foreach (var c in cards)
        {
            sb.AppendLine($"{c.Id},{c.CardCodeMasked},{c.TotalDurationSeconds / 60},{c.RemainingSeconds / 60},{c.Status},{c.ExpiresAtUtc:yyyy-MM-dd}");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"Batch_{batch.BatchName}_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}
