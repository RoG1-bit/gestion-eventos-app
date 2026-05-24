import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme() {
  const scheme = useColorScheme();

  // CORRECCIÓN: Si el sistema no detecta el tema (null/undefined/unspecified), forzamos el modo 'light'
  const theme = !scheme || scheme === "unspecified" ? "light" : scheme;

  // Nos aseguramos de que siempre retorne un color válido para evitar pantallas rojas/blancas
  return Colors[theme] || Colors.light;
}
