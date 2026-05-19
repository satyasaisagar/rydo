import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF00C853);
  static const Color darkBg       = Color(0xFF0A0A0A);
  static const Color cardBg       = Color(0xFF111111);
  static const Color borderColor  = Color(0x0FFFFFFF);
  static const Color mutedText    = Color(0xFF6B7280);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: primaryGreen,
      colorScheme: const ColorScheme.dark(
        primary:   primaryGreen,
        secondary: primaryGreen,
        surface:   cardBg,
        onPrimary: Colors.black,
        onSurface: Colors.white,
      ),
      fontFamily: 'DM Sans',
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBg,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'DM Sans',
          fontWeight: FontWeight.w600,
          fontSize: 17,
          color: Colors.white,
        ),
        iconTheme: IconThemeData(color: Colors.white),
      ),
      textTheme: const TextTheme(
        headlineLarge:  TextStyle(fontWeight: FontWeight.w700, color: Colors.white),
        headlineMedium: TextStyle(fontWeight: FontWeight.w700, color: Colors.white),
        titleLarge:     TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
        titleMedium:    TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
        bodyLarge:      TextStyle(color: Colors.white),
        bodyMedium:     TextStyle(color: Color(0xFFCCCCCC)),
        bodySmall:      TextStyle(color: mutedText),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryGreen, width: 1.5),
        ),
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(
            fontFamily: 'DM Sans',
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      cardTheme: CardTheme(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: Colors.white.withOpacity(0.06)),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: cardBg,
        selectedItemColor: primaryGreen,
        unselectedItemColor: Color(0xFF6B7280),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
