# CyberCenter ⚡

> **نظام مركزي متكامل لإدارة مراكز الإنترنت وصالات الألعاب الاحترافية**  
> *Production-Ready, Centralized Internet Café & Gaming Center Management Platform*

[![Status](https://img.shields.io/badge/Status-Phase%200%20Architecture-blue.svg)](#)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11%20%7C%20Linux%20Server-brightgreen.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-.NET%208%20LTS%20%7C%20React%2018%20%7C%20PostgreSQL-indigo.svg)](#)

---

## 📖 نظرة عامة (Overview)

**CyberCenter** هو حل برمجي هندسي شامل ومصمم لتلبية أعلى معايير الاستقرار والأمان في إدارة صالات الألعاب التنافسية (eSports Lounges) ومراكز الإنترنت (Internet Cafés). يوفر النظام تحكماً مركزياً عالي الدقة في محطات العمل (Windows Client Stations) عبر خادم خلفي فائق السرعة، مع لوحة تحكم إدارية ومحاسبية تفاعلية (Dark Premium Web Dashboard) وتطبيق عميل متطور يعمل بتناغم لمنع التلاعب وتوفير تجربة مستخدم استثنائية للاعبين والزوار.

---

## 🏗️ البنية الهندسية للنظام (Architecture Components)

يتكون المشروع من ثلاثة أنظمة مترابطة عبر بروتوكولات آمنة وموثقة:

```mermaid
flowchart TB
    subgraph AdminLayer["طبقة الإدارة والتحكم (Admin Web Layer)"]
        Dashboard["React Admin Dashboard (Vite + TS + Tailwind)\n[Dark Premium - RTL / LTR]"]
    end

    subgraph ServerLayer["الخادم المركزي (Central Server Backend)"]
        API["ASP.NET Core Web API (Modular Monolith)"]
        Hub["SignalR Real-Time Gateway"]
        Workers["Background Lease & Heartbeat Workers"]
        DB[(PostgreSQL Central Database)]
        API --> DB
        Workers --> DB
        Hub <--> API
    end

    subgraph ClientLayer["محطات أجهزة العملاء (Client Stations - Windows)"]
        Agent["CyberCenter.Agent\n(Windows Service - System Privileges)"]
        Shell["CyberCenter.Shell\n(WPF Gaming UI - Standard User)"]
        HUD["CyberCenter.HUD\n(Borderless Lightweight Overlay)"]
        Agent <--> Shell
        Shell <--> HUD
    end

    Dashboard <--"HTTPS REST / SignalR"--> API
    Agent <--"WSS Secure SignalR / Signed REST"--> Hub
```

1. **Web Admin Dashboard (`CyberCenter.Dashboard`):**
   - واجهة إدارية حديثة مبنية بـ React 18 و TypeScript و Tailwind CSS.
   - هوية Dark Premium تدعم اللغتين العربية (افتراضياً بتقنية RTL كاملة) والإنجليزية.
   - شاشات مراقبة الأجهزة الحية، إدارة الحسابات، الكروت المؤقتة، نقاط البيع والمتجر، المحاسبة الدقيقة وإقفال الفترات المالية، مراقبة استهلاك الإنترنت وتكلفة الطاقة.

2. **Central Backend Server (`CyberCenter.Server`):**
   - مبني وفق مبادئ **Clean Architecture** و **Modular Monolith** على منصة **ASP.NET Core 8 LTS**.
   - اتصال فوري ثنائي الاتجاه عبر **SignalR WebSockets** مع خوارزميات Session Lease للتعامل مع انقطاع الشبكة دون فقدان الوقت.
   - قاعدة بيانات **PostgreSQL** موثوقة مع عمليات مالية محصورة في Database Transactions غير قابلة للتلاعب وسجل تدقيق شامل (Audit Log).

3. **Windows Client Suite (`CyberCenter.Client`):**
   - **`CyberCenter.Agent`**: خدمة نظام مستقلة (Windows Worker Service) تدير أمان المحطة، تنفيذ الأوامر الموقعة (Signed Commands)، إرسال الـ Heartbeat ومراقبة سلامة الجلسة بدون منح المستخدم صلاحيات مدير.
   - **`CyberCenter.Shell`**: واجهة المستخدم الرئيسية (WPF / XAML) لتسجيل الدخول، استعراض مكتبة الألعاب والطلبات.
   - **`CyberCenter.HUD`**: شريط علوي خفيف غير تدخلي يعرض الوقت المتبقي، سرعة الإنترنت والاستهلاك، دون حقن أكواد (No DLL Injection) متوافق تماماً مع أنظمة مكافحة الغش (Anti-Cheat).

---

## 📁 هيكل المجلدات (Repository Structure)

```text
CyberCenter/
├── src/
│   ├── Server/
│   │   ├── CyberCenter.API/            # نقطة الدخول، Controllers، Hubs، Middleware
│   │   ├── CyberCenter.Application/    # حالات الاستخدام، CQRS/Services، DTOs، Validators
│   │   ├── CyberCenter.Domain/         # الكيانات (Entities)، التعدادات (Enums)، قواعد الأعمال
│   │   ├── CyberCenter.Infrastructure/ # EF Core، PostgreSQL DbContext، Repositories، Security
│   │   └── CyberCenter.Workers/        # Background Services، Session Leases، Heartbeat Monitor
│   │
│   ├── Client/
│   │   ├── CyberCenter.Agent/          # Windows Service لضبط الأمان والتواصل المركزي
│   │   ├── CyberCenter.Shell/          # واجهة سطح المكتب الحديثة للألعاب والجلسات
│   │   └── CyberCenter.HUD/            # شريط التراكب الشفاف للوقت والشبكة
│   │
│   ├── Admin/
│   │   └── CyberCenter.Dashboard/      # لوحة الإدارة (React, Vite, TypeScript, Tailwind)
│   │
│   └── Shared/
│       └── CyberCenter.Contracts/      # العقود المشتركة، DTOs، Enums الموحدة
│
├── tests/
│   ├── CyberCenter.UnitTests/          # اختبارات الوحدة للمنطق المحاسبي والجلسات
│   ├── CyberCenter.IntegrationTests/   # اختبارات تكامل الـ API وقاعدة البيانات
│   └── CyberCenter.ClientTests/        # اختبارات خدمة العميل والـ IPC
│
├── deployment/
│   ├── server/                         # إعدادات النشر، Docker Compose، Systemd/IIS
│   ├── client/                         # حزم تثبيت العميل ومثبتات الـ Windows Service
│   ├── windows-policies/               # سياسات Shell Launcher، WDAC، GPO لتأمين المحطات
│   └── scripts/                        # سكربتات النسخ الاحتياطي والأتمتة
│
├── docs/                               # التوثيق المعماري والتقني الشامل
├── .gitignore
└── README.md
```

---

## 🛡️ المبادئ الأمنية الصارمة (Security Principles)

- **Defense-in-Depth (الدفاع متعدد الطبقات):** فصل واجهة المستخدم عن خدمة النظام، تشغيل المستخدمين بحسابات قياسية (Standard User) دون صلاحيات Administrator.
- **Signed Commands & Allowlist:** منع تنفيذ أوامر النظام العشوائية؛ جميع أوامر الخادم للجهاز موثقة ومشفرة ومحددة بقائمة بيضاء مسبقة.
- **Anti-Cheat Safe:** عدم استخدام تقنيات الحقن (DLL Injection) أو التعديل على ذاكرة الألعاب حتى لا تتعرض حسابات الزوار للحظر في ألعاب eSports.
- **Financial Auditability:** القيود المالية غير قابلة للحذف، ويتم تسجيل كافة العمليات الإدارية في جدول `AuditLogs` غير القابل للتعديل مع قيود Foreign Key و Transactions.
- **No Secrets in Repo:** حظر إدراج كلمات السر، الـ Connection Strings، أو مفاتيح التشفير داخل الشيفرة البرمجية والاعتماد على بيئة التشغيل المشفرة و Secrets Store.

---

## 📚 التوثيق الهندسي (Project Documentation)

تم توثيق النظام بمعايير Enterprise متقدمة في مجلد `docs/`:
- [نظرة عامة على المشروع (Project Overview)](file:///docs/PROJECT_OVERVIEW.md)
- [المتطلبات الوظيفية والتقنية (Requirements)](file:///docs/REQUIREMENTS.md)
- [معمارية النظام والاتصالات (System Architecture)](file:///docs/SYSTEM_ARCHITECTURE.md)
- [تصميم قاعدة البيانات (Database Design)](file:///docs/DATABASE_DESIGN.md)
- [الخطة الأمنية وسياسات ويندوز (Security Plan)](file:///docs/SECURITY_PLAN.md)
- [خارطة الطريق ومراحل التنفيذ (Implementation Roadmap)](file:///docs/IMPLEMENTATION_ROADMAP.md)
- [دليل تجربة وواجهة المستخدم (UI/UX Guidelines)](file:///docs/UI_UX_GUIDELINES.md)
- [استراتيجية الاختبار وضمان الجودة (Testing Strategy)](file:///docs/TESTING_STRATEGY.md)
- [سجل القرارات المعمارية (Decisions Log / ADRs)](file:///docs/DECISIONS.md)

---

## 🚀 البدء السريع (Getting Started)

سيتم توفير تفاصيل التشغيل خطوة بخطوة عند اكتمال المرحلة التأسيسية (Phase 1).  
متطلبات البيئة الأساسية:
- **.NET 8 SDK (LTS)** أو أحدث
- **Node.js (v18+)** و **npm**
- **PostgreSQL 15+**
- نظام تشغيل **Windows 10 / 11** لمحطات العملاء.

