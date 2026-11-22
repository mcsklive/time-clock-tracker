# Project Guidance

## User Preferences

- ใช้ภาษาไทยสำหรับข้อความและป้ายกำกับทั้งหมดในแอป
- ปุ่มบันทึกต้องหาเจอง่ายและกดได้สะดวกทั้งบนเดสก์ท็อปและมือถือ
- ใช้ฟอนต์ TH Sarabun กับทุกข้อความในแอป

## Accepted Requirements

- ดูรายการย้อนหลัง กรองตามวันที่และอีเมลผู้รับการโค้ช และสรุปจำนวนต่อคน
- เข้าสู่ระบบด้วย Internet Identity และเห็นเฉพาะข้อมูลของตนเอง
- เลือกสถานะได้ 3 แบบ: Training, Coaching, แชทขาออก
- กรอกเวลาเริ่มและเวลาสิ้นสุดในฟอร์มบันทึก
- ใช้ฟอนต์ TH Sarabun ทั้งหน้า UI
- ฟอร์มมีวันที่ เหตุผลที่ใช้สถานะ และผู้อนุมัติ (อีเมลงานหลายคน บรรทัดละหนึ่งอีเมล)
- บันทึกการโค้ชชิ่งทีมแชทเซลส์ตามรูปแบบฟอร์ม Training Coaching Log
- เพิ่มข้อมูลอีเมลที่ใช้เข้าสู่ระบบ ชื่อที่แสดง และบทบาทหน้าที่ของผู้มีสิทธิ์
- ปฏิเสธการเข้าสู่ระบบสำหรับอีเมลที่อยู่นอกรายชื่อ

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Result must be imported from mo:core/Result in Motoko modules; annotate Int accumulators explicitly to avoid Nat inference.
- This project has no sr-only utility; hide a fieldset legend with absolute size-px overflow-hidden [clip:rect(0_0_0_0)].
- Biome rejects role=group on a div of buttons; use fieldset plus legend instead, and mark decorative gauges aria-hidden.
- แอปนี้เป็นบันทึกการอบรมและโค้ชชิ่งทีมแชทเซลส์ ข้อมูลแยกตามผู้ใช้ที่เข้าสู่ระบบด้วย Internet Identity
- Backend methods return Result variants; the frontend must check result.__kind__ === 'err' and map errors with a Thai message helper instead of throwing.
- The app is now a coaching log (COACHLOG) with routes / (LogPage) and /entries (EntriesPage); the old attendance screens and their Thai labels are gone.
- CoachingEntry optional fields are `?: T` (undefined), not Option; pass null to createEntry/updateMyEntry for absent followUpDate/notes.
- The history page keeps its filters in the URL search parameters through the nested route id '/app/entries'.
- OQL auto-derivation cannot handle [Text] or nested optionals; the coachingEntry entity uses Entity.manual with an explicit .payload per field.
- mo:core Text.trim requires a Pattern; bind a local isSpace predicate function instead of a qualified Char.isWhitespace inside #predicate.
- The log record is EntryStatus (#training/#coaching/#outboundChat) with sessionDate, startTime, endTime, reason and approverEmails; the old coach/topic/observation/feedback/actionItems/followUpDate/notes fields are gone.
- The history page reuses EntryDetailDialog, EntryForm and DeleteEntryDialog so entries can be edited and deleted from /entries; key EntryForm by entry.id so the edit draft re-initializes per entry.
- TH Sarabun is wired through --font-display/body/mono in index.css and fontFamily in tailwind.config.js; font files live in public/assets/fonts. It renders small, so body copy uses text-sm and headings text-2xl/3xl.
- success/warning CSS variables exist in index.css but are not registered in tailwind.config.js colors, so text-success/bg-warning classes emit nothing.
- The email filter and per-person summary derive from approverEmails only; there is no separate coached-recipient email field.
- mo:core Text has startsWith/endsWith, not starts/ends; Result needs an explicit mo:core/Result import.
- The app gates access on an allowlist of 34 approved emails seeded in migration 20261122_180000.mo, keyed by normalized (trim+lowercase) email; there is no admin screen for editing it.
- MixinAuthorization's onAttributesVerified callback receives attrs.email (verified_email only); main.mo stores it per principal in verifiedEmails and AccessApi reads it.
- Every coaching method calls requireAccess from lib/access.mo, so a caller whose verified email is not on the allowlist traps instead of reading or writing records.
- The frontend gate is RequireSignIn then RequireAccess in router.tsx; RequireAccess renders AccessDeniedScreen with a reason of noEmail or notListed.
- InternetIdentityProvider in main.tsx requests the verified_email attribute through withAttributes={{keys:['verified_email']}}; LoginOptions has no attributes field.
- Verify.verify<system>(store) is synchronous; bind its Result to a let and switch on it, never await it.
- success and warning colour tokens are now registered in tailwind.config.js colors, so text-success/bg-warning classes render.
- Decorative spinners and fade-up animations use motion-reduce:animate-none to respect reduced motion.
- Local e2e sign-in uses an identity without an Internet Identity attribute bundle, so the allowlist gate shows the no-verified-email screen in local testing even though a real Google or Microsoft sign-in supplies the email.
