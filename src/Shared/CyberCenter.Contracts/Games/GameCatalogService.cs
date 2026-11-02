using System;
using System.Collections.Generic;

namespace CyberCenter.Contracts.Games;

public record GameCatalogItem(
    string Id,
    string Title,
    string Category,
    string ExecutablePath,
    string IconColor,
    string Tag,
    bool IsInstalled,
    string Description
);

public static class GameCatalogService
{
    public static List<GameCatalogItem> GetDefaultCatalog()
    {
        return new List<GameCatalogItem>
        {
            // FPS & Shooters
            new(
                "cs2",
                "Counter-Strike 2",
                "Shooters & FPS",
                "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe",
                "#F59E0B", // Amber
                "ESPORTS",
                true,
                "لعبة التصويب التكتيكية الأولى عالمياً من Valve بمحرك Source 2."
            ),
            new(
                "val",
                "VALORANT",
                "Shooters & FPS",
                "C:\\Riot Games\\VALORANT\\live\\VALORANT.exe",
                "#EF4444", // Red
                "TACTICAL",
                true,
                "لعبة إطلاق نار تكتيكية 5 ضد 5 من Riot Games تعتمد على قدرات الشخصيات."
            ),
            new(
                "apex",
                "Apex Legends",
                "Shooters & FPS",
                "C:\\Program Files\\EA Games\\Apex\\r5apex.exe",
                "#EC4899", // Pink
                "FAST-PACED",
                true,
                "باتل رويال جماعي يجمع أساطير بقدرات قتالية خارقة في ساحة المعركة."
            ),
            new(
                "cod_wz",
                "Call of Duty: Warzone",
                "Shooters & FPS",
                "C:\\Program Files (x86)\\Call of Duty\\Warzone.exe",
                "#10B981", // Emerald
                "4K HDR",
                true,
                "المعركة الكبرى في ساحة القتال العملاقة المجانية من Activision."
            ),

            // Battle Royale
            new(
                "pubg",
                "PUBG: BATTLEGROUNDS",
                "Battle Royale",
                "C:\\Program Files (x86)\\Steam\\steamapps\\common\\PUBG\\TslGame\\Binaries\\Win64\\TslGame.exe",
                "#F97316", // Orange
                "SURVIVAL",
                true,
                "اهبط واجمع العتاد ونافس 99 لاعباً لتكون الناجي الأخير."
            ),
            new(
                "fortnite",
                "Fortnite",
                "Battle Royale",
                "C:\\Program Files\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe",
                "#8B5CF6", // Purple
                "CROSS-PLAY",
                true,
                "عالم باتل رويال والبناء والإبداع غير المحدود من Epic Games."
            ),

            // Sports & Racing
            new(
                "fc24",
                "EA SPORTS FC 24",
                "Sports & Racing",
                "C:\\Program Files\\EA Games\\FC24\\FC24.exe",
                "#06B6D4", // Cyan
                "NEW GEN",
                true,
                "أحدث تجربة واقعية لكرة القدم العالمية مع تقنية HyperMotionV."
            ),
            new(
                "rl",
                "Rocket League",
                "Sports & Racing",
                "C:\\Program Files\\Epic Games\\rocketleague\\Binaries\\Win64\\RocketLeague.exe",
                "#3B82F6", // Blue
                "ARCADE",
                true,
                "كرة قدم سيارات نفاثة في مباريات إيقاعها فائق السرعة."
            ),
            new(
                "forza",
                "Forza Horizon 5",
                "Sports & Racing",
                "C:\\XboxGames\\Forza Horizon 5\\Content\\ForzaHorizon5.exe",
                "#F43F5E", // Rose
                "OPEN WORLD",
                true,
                "استكشف مناظر المكسيك الخلابة بأسرع السيارات في العالم."
            ),

            // Action & Adventure
            new(
                "gtav",
                "Grand Theft Auto V",
                "Action & Adventure",
                "C:\\Program Files\\Rockstar Games\\Grand Theft Auto V\\GTA5.exe",
                "#84CC16", // Lime
                "GTA ONLINE",
                true,
                "عالم لوس سانتوس المفتوح والمليء بالمغامرات والمهام الجماعية."
            ),
            new(
                "elden",
                "Elden Ring",
                "Action & Adventure",
                "C:\\Program Files (x86)\\Steam\\steamapps\\common\\ELDEN RING\\Game\\eldenring.exe",
                "#EAB308", // Yellow
                "GOTY",
                true,
                "مغامرة تقمص الأدوار الخيالية الملحمية في الأراضي الواقعة بين البرزخ."
            ),

            // Apps & Launchers
            new(
                "steam",
                "Steam Client",
                "Apps & Tools",
                "C:\\Program Files (x86)\\Steam\\steam.exe",
                "#64748B",
                "LAUNCHER",
                true,
                "منصة الألعاب الأضخم لتشغيل ألعابك الخاصة ومجتمع اللاعبين."
            ),
            new(
                "discord",
                "Discord",
                "Apps & Tools",
                "C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe",
                "#6366F1",
                "VOICE CHAT",
                true,
                "محادثات صوتية عالية النقاوة وسيرفرات ألعاب مع فريقك."
            ),
            new(
                "chrome",
                "Google Chrome",
                "Apps & Tools",
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                "#0EA5E9",
                "BROWSER",
                true,
                "متصفح الإنترنت فائق السرعة لتصفح مقاطع اليوتيوب والمواقع."
            ),
        };
    }
}

