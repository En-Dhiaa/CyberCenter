# سياسات تأمين ويندوز لمحطات العملاء (Windows Policies & Station Hardening)

توضح هذه الوثيقة السياسات المعتمدة في **CyberCenter** لتأمين محطات الزوار واللاعبين:

## 1. متطلبات الترخيص وإصدارات ويندوز (Windows Editions)
- **Windows 10 / 11 Enterprise أو Education:** يدعم الخصائص الكاملة: `Windows Shell Launcher v2`, `App Control for Business (WDAC)`, `Assigned Access (Kiosk)`.
- **Windows 10 / 11 Pro:** يدعم `Local Group Policy (gpedit.msc)`، حظر تشغيل البرمجيات عبر الـ Registry، وتعطيل مدير المهام وموجه الأوامر.

## 2. السياسات المطبقة على حساب المستخدم القياسي (`CyberGuest`):
1. **تعطيل أدوات إدارة النظام:**
   - `HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System` ➔ `DisableTaskMgr = 1`
   - `HKCU\Software\Policies\Microsoft\Windows\System` ➔ `DisableCMD = 1`
   - `HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System` ➔ `DisableRegistryTools = 1`
2. **تعطيل اختصارات القفل ومفاتيح النظام الحساسة:**
   - `DisableLockWorkstation = 1` (منع تعارض قفل ويندوز مع واجهة المركز).
3. **حظر وحدات التخزين الخارجية (USB Storage):**
   - حظر الـ USB Storage عبر `HKLM\SYSTEM\CurrentControlSet\Services\USBSTOR` (Start = 4) مع إبقاء أجهزة الـ HID (الماوس، الكيبورد، سماعات الألعاب) تعمل دون أي عائق.

