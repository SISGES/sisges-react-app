import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const darkThemeOptions: ThemeOptions = {
    palette: {
        mode: "dark",
        primary: {
            main: "#3B82F6",
            light: "#60A5FA",
            dark: "#2563EB",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#10B981",
            light: "#34D399",
            dark: "#059669",
            contrastText: "#FFFFFF",
        },
        error: {
            main: "#EF4444",
            light: "#F87171",
            dark: "#DC2626",
            contrastText: "#FFFFFF",
        },
        warning: {
            main: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
            contrastText: "#000000",
        },
        background: {
            default: "#000000",
            paper: "#0A0A0A",
        },
        text: {
            primary: "#FFFFFF",
            secondary: "#E5E5E5",
        },
        divider: "#1A1A1A",
        action: {
            active: "#FFFFFF",
            hover: "#1A1A1A",
            selected: "#1A1A1A",
            disabled: "#404040",
            disabledBackground: "#1A1A1A",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                        transition: "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    transition: "background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                },
            },
        },
    },
};

const lightThemeOptions: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#2563EB",
            light: "#60A5FA",
        },
        secondary: {
            main: "#10B981",
        },
        error: {
            main: "#EF4444",
        },
        warning: {
            main: "#F59E0B",
        },
        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0F172A",
            secondary: "#475569",
        },
        divider: "#E2E8F0",
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                        transition: "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    transition: "background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                },
            },
        },
    },
};

export const darkTheme = createTheme(darkThemeOptions);
export const lightTheme = createTheme(lightThemeOptions);
