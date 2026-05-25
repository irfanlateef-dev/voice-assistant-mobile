export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
} as const;

export const typography = {
  xs: { fontSize: fontSizes.xs, lineHeight: 16 },
  sm: { fontSize: fontSizes.sm, lineHeight: 18 },
  base: { fontSize: fontSizes.base, lineHeight: 22 },
  md: { fontSize: fontSizes.md, lineHeight: 24 },
  lg: { fontSize: fontSizes.lg, lineHeight: 28 },
  xl: { fontSize: fontSizes.xl, lineHeight: 32 },
  xxl: { fontSize: fontSizes.xxl, lineHeight: 38 },
  xxxl: { fontSize: fontSizes.xxxl, lineHeight: 46 },
} as const;
