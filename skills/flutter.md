# Skill: Flutter (Dart)

Build, design, and convert DesignKit UI using Flutter.

## Your role

You are a Flutter developer with strong UI skills.
You can:
- **Design** a screen from scratch using the token system
- **Convert** a DesignKit HTML file to Flutter Widget tree
- **Build** a full feature (onboarding flow, tab navigation, list + detail, etc.)

Read the request and determine which mode applies.

## Token class (`lib/tokens.dart`)

```dart
import 'package:flutter/material.dart';

class T {
  // Colors
  static const primary      = Color(0xFF6366F1);
  static const primaryText  = Color(0xFFFFFFFF);
  static const secondary    = Color(0xFF64748B);
  static const accent       = Color(0xFFF59E0B);
  static const bg           = Color(0xFFFFFFFF);
  static const surface      = Color(0xFFF8FAFC);
  static const surface2     = Color(0xFFF1F5F9);
  static const textPrimary  = Color(0xFF0F172A);
  static const text2        = Color(0xFF475569);
  static const text3        = Color(0xFF94A3B8);
  static const border       = Color(0xFFE2E8F0);
  static const success      = Color(0xFF22C55E);
  static const error        = Color(0xFFEF4444);
  static const warning      = Color(0xFFF59E0B);

  // Border radius
  static const radiusSm     = BorderRadius.all(Radius.circular(6));
  static const radius       = BorderRadius.all(Radius.circular(10));
  static const radiusLg     = BorderRadius.all(Radius.circular(14));
  static const radiusXl     = BorderRadius.all(Radius.circular(20));
  static const radiusFull   = BorderRadius.all(Radius.circular(9999));

  // Spacing
  static const space1 = 4.0;
  static const space2 = 8.0;
  static const space3 = 12.0;
  static const space4 = 16.0;
  static const space5 = 20.0;
  static const space6 = 24.0;
  static const space8 = 32.0;

  // Shadows
  static const shadowSm = [
    BoxShadow(color: Color(0x14000000), blurRadius: 3, offset: Offset(0, 1))
  ];
  static const shadow = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 12, offset: Offset(0, 4))
  ];
  static const shadowLg = [
    BoxShadow(color: Color(0x1F000000), blurRadius: 32, offset: Offset(0, 8))
  ];

  // Typography
  static const fontFamily = 'Inter';
  static TextStyle textXs({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 11, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle textSm({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 13, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle textMd({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 15, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle textLg({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 17, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle textXl({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 20, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle text2xl({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 24, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
  static TextStyle text3xl({Color? color, FontWeight? weight}) =>
      TextStyle(fontSize: 32, fontFamily: fontFamily, color: color ?? textPrimary, fontWeight: weight);
}
```

## HTML → Flutter mapping

| HTML | Flutter |
|------|---------|
| `<div style="display:flex">` | `Row()` |
| `<div style="display:flex; flex-direction:column">` | `Column()` |
| `<div style="position:relative">` | `Stack()` |
| `<div style="overflow-y:auto">` | `SingleChildScrollView()` or `ListView()` |
| `<div style="background:X; border-radius:Y; padding:Z">` | `Container(decoration: BoxDecoration(...), padding: ...)` |
| `<button>` | `ElevatedButton()` or `GestureDetector()` |
| `<input>` | `TextField()` |
| `<img>` | `Image.network()` or `Container(color: Colors.grey[200])` |
| `<span>` / `<p>` / `<h1>` | `Text()` |
| `gap: 8px` in flex | `SizedBox(width/height: 8)` or `mainAxisAlignment` |

## Output format

```dart
import 'package:flutter/material.dart';
import '../tokens.dart';

class ScreenName extends StatefulWidget {
  const ScreenName({super.key});

  @override
  State<ScreenName> createState() => _ScreenNameState();
}

class _ScreenNameState extends State<ScreenName> {
  // state here

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: T.bg,
      body: SafeArea(
        child: Column(
          children: [
            // widgets here
          ],
        ),
      ),
    );
  }
}
```

## Rules

- **`T.*` tokens** — never hardcode Color(0xFF...)
- **`const`** constructors everywhere possible
- **`SafeArea`** wrapping body for iOS notch/bottom bar
- **`SizedBox`** for spacing — not `Padding` with one side
- **`StatefulWidget`** only when state is needed, otherwise `StatelessWidget`
- **Screen width** — use `MediaQuery.of(context).size.width`, not hardcoded 390

## Example prompt

```
Read AI-AGENT.md and skills/flutter.md, then:

Design and build a finance app home screen in Flutter:
- iOS status bar area (SafeArea)
- Top bar: greeting "Good morning, John" + notification bell
- Balance card: gradient indigo, large balance number, +12.5% label
- Quick actions: Send, Receive, Pay, More (2x2 or row)
- "Recent Transactions" header
- 4 transaction list items (icon, title, date, amount)
- Bottom navigation: 5 tabs

Output:
- lib/screens/home_screen.dart
- lib/tokens.dart
```
