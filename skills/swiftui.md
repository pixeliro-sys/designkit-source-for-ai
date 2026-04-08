# Skill: SwiftUI (iOS)

Build, design, and convert DesignKit UI using SwiftUI.

## Your role

You are an iOS developer with strong UI skills.
You can:
- **Design** a screen from scratch using the token system
- **Convert** a DesignKit HTML file to SwiftUI Views
- **Build** a full feature (onboarding, tab bar app, list + detail, settings, etc.)

Read the request and determine which mode applies.

## Token struct (`Tokens.swift`)

```swift
import SwiftUI

struct T {
  // Colors
  static let primary      = Color(hex: "#6366F1")
  static let primaryText  = Color.white
  static let bg           = Color(hex: "#FFFFFF")
  static let surface      = Color(hex: "#F8FAFC")
  static let surface2     = Color(hex: "#F1F5F9")
  static let textPrimary  = Color(hex: "#0F172A")
  static let text2        = Color(hex: "#475569")
  static let text3        = Color(hex: "#94A3B8")
  static let border       = Color(hex: "#E2E8F0")
  static let success      = Color(hex: "#22C55E")
  static let error        = Color(hex: "#EF4444")
  static let warning      = Color(hex: "#F59E0B")

  // Border radius
  static let radiusSm:   CGFloat = 6
  static let radius:     CGFloat = 10
  static let radiusLg:   CGFloat = 14
  static let radiusXl:   CGFloat = 20

  // Spacing
  static let space1:  CGFloat = 4
  static let space2:  CGFloat = 8
  static let space3:  CGFloat = 12
  static let space4:  CGFloat = 16
  static let space5:  CGFloat = 20
  static let space6:  CGFloat = 24
  static let space8:  CGFloat = 32

  // Typography
  static let fontSm:  Font = .system(size: 13)
  static let fontMd:  Font = .system(size: 15)
  static let fontLg:  Font = .system(size: 17)
  static let fontXl:  Font = .system(size: 20, weight: .semibold)
  static let font2xl: Font = .system(size: 24, weight: .bold)
  static let font3xl: Font = .system(size: 32, weight: .bold)
}

// Hex color initializer
extension Color {
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let r = Double((int >> 16) & 0xFF) / 255
    let g = Double((int >> 8) & 0xFF) / 255
    let b = Double(int & 0xFF) / 255
    self.init(red: r, green: g, blue: b)
  }
}
```

## HTML → SwiftUI mapping

| HTML | SwiftUI |
|------|---------|
| `<div style="display:flex">` | `HStack {}` |
| `<div style="flex-direction:column">` | `VStack(alignment: .leading) {}` |
| `<div style="position:relative">` | `ZStack {}` |
| `<div style="overflow-y:auto">` | `ScrollView {}` |
| `<div style="background:X; border-radius:Y; padding:Z">` | `.background(X).clipShape(RoundedRectangle(cornerRadius: Y)).padding(Z)` |
| `<button>` | `Button {}` |
| `<input>` | `TextField("placeholder", text: $value)` |
| `<img>` | `AsyncImage(url:)` or `Rectangle().fill(Color.gray.opacity(0.2))` |
| `<span>` / `<p>` | `Text("...")` |
| `<h1>` | `Text("...").font(.largeTitle).fontWeight(.bold)` |
| `gap: 16px` | `VStack(spacing: 16)` or `HStack(spacing: 16)` |
| `flex: 1` | `.frame(maxWidth: .infinity)` |

## Output format

```swift
import SwiftUI

struct ScreenNameView: View {
  // @State, @Binding, @ObservedObject here

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: T.space4) {
          // content here
        }
        .padding(T.space4)
      }
      .background(T.bg)
      .navigationTitle("Screen Name")
      .navigationBarTitleDisplayMode(.large)
    }
  }
}

#Preview {
  ScreenNameView()
}
```

## iOS-specific patterns

```swift
// Safe area + tab bar
TabView {
  HomeView().tabItem { Label("Home", systemImage: "house.fill") }
  SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
}

// Card
RoundedRectangle(cornerRadius: T.radiusLg)
  .fill(T.surface)
  .overlay(
    VStack(alignment: .leading, spacing: T.space2) {
      Text("Title").font(T.fontLg).fontWeight(.semibold)
      Text("Subtitle").font(T.fontSm).foregroundColor(T.text2)
    }
    .padding(T.space4)
    , alignment: .topLeading
  )
  .shadow(color: .black.opacity(0.08), radius: 3, y: 1)

// Gradient card
LinearGradient(colors: [T.primary, Color(hex: "#8B5CF6")],
               startPoint: .topLeading, endPoint: .bottomTrailing)
  .clipShape(RoundedRectangle(cornerRadius: T.radiusXl))
```

## Rules

- **`T.*` tokens** — never hardcode Color or CGFloat
- **`@State` / `@Binding`** for local vs passed state
- **`NavigationStack`** not deprecated `NavigationView`
- **`.frame(maxWidth: .infinity)`** for full-width elements
- **`Spacer()`** for flex alignment
- **iOS 17+** target — use latest SwiftUI APIs

## Example prompt

```
Read AI-AGENT.md and skills/swiftui.md, then:

Design and build a finance app home screen in SwiftUI:
- Navigation bar: greeting + notification bell icon
- Balance card: gradient (indigo → purple), large balance $12,450, +12.5% badge
- Quick actions HStack: Send, Receive, Pay, More (icon + label)
- "Recent Transactions" section header
- 4 transaction rows (icon, merchant, date, amount with color)
- TabView bottom bar: Home, Cards, Analytics, Profile

Output:
- HomeView.swift
- Tokens.swift
```
