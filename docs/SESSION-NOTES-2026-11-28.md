# עדכון משיחת האתר (27–28.11.2026) · מה השתנה באפליקציה

> לקרוא לפני שממשיכים לעבוד על האפליקציה. כל השינויים כבר ב-main.

## 1. מאמר מחירים
- נוסף מאמר `price` ("כמה עולה קעקוע") ראשון ב-`ARTICLES` ב-`js/content.js` (אותו טקסט כמו באתר).

## 2. סביבון חנוכה (פעיל רק 4.12–12.12.2026)
- `js/dreidel/` – מודול משותף לאתר ולאפליקציה (three.js + RoomEnvironment, סביבון תלת-ממד ממותג).
- `js/app.js`: `dreidelOn()`, `dreidelPrize()`, `dreidelCard()` (כרטיס בדף הבית), מאזין קליק על `[data-dreidel]`.
- הזכייה נשמרת ב-localStorage `tt-dreidel-26` ומתווספת לפנייה לתום (`#/contact`, chip + שורה בהודעה) עד 31.12.
- פרסים: נ 20% · ג 30% · ה 40% · פ קעקוע שני מתנה. סיכויים 45/30/20/5.
- שרת: `action=dreidel&tel=05…` ב-Apps Script (SCRIPT_VERSION 30, גרסת פריסה 29) – סיבוב אחד לכל טלפון, גיליון "סביבון חנוכה" בדרייב של תום (טלפון, זכייה, קוד, תאריך, מומש?). לפני/אחרי התאריכים מחזיר `{ok:false,closed:true}`.
- CSS: בלוק "Hanukkah dreidel" בסוף `css/styles.css`. לוגו: `assets/img/logo-ink.png`.

## 3. "איך זה ייראה עליי?" (הדמיה)
- כפתור "↺ איפוס · להתחיל מחדש" (`#try-reset`).
- הקנבס מוגבל ל-58vh, `touch-action: pan-y` עד שיש סקיצה (`.try-stage.live`) – אפשר לגלול. אין קפיצה אחרי תמונת גוף.
- ייצוא מוגבל ל-1800px בצד הארוך (היה איטי מאוד בתמונות מצלמה).
- כפתורים נועלים את עצמם ומראים "שולח…"/"שומר…" מיד (`busy` + `tick`).
- **שליחה לתום**: קודם מייל (`sendPhotosToTom`, מספר הדמיה), ואז:
  - אנדרואיד: פלאגין נייטיב `WaShare.share` פותח את הצ'אט של תום בוואטסאפ עם התמונה מצורפת (גיבוי: תפריט שיתוף).
  - אייפון/אתר: `goWa()` – `location.href` לוואטסאפ בטלפון (לא נחסם), לשונית חדשה במחשב. בלי כפתור "להמשיך לוואטסאפ".
- **שמירה**: אנדרואיד 10+ שומר ישר לגלריה (`WaShare.saveImage` → Pictures/Tomchu Tattoo). אחרת – שיתוף/הורדה כמו קודם.

## 4. נייטיב אנדרואיד
- `native/android-src/` (לא `native/android/` – `android/` ב-.gitignore!): `WaSharePlugin.java`, `MainActivity.java` (registerPlugin), `file_paths.xml`.
- צעד חדש ב-`.github/workflows/android.yml`: "Native WhatsApp share plugin" (אחרי `cap add android`).

## 5. גרסאות
- sw.js: tomchu-v70.
- Play (Closed testing - Alpha): 1.0.100 (מאמר+איפוס+סביבון) ✓ · 1.0.102 ✓ · 1.0.105 (וואטסאפ ישיר) ✓ · 1.0.107 (מהירות+גלריה) נשלח לבדיקה 28.11.
- העלאה ל-Play נעשתה מהכרום: fetch ל-`play-upload/TomchuTattoo-vX.aab` והזרקה ל-input[type=file] עם DataTransfer.
- הענפים `dreidel-hanukkah`, `wa-direct`, `fewer-taps` מוזגו – אפשר למחוק.
