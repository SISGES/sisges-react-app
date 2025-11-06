import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const darkThemeOptions: ThemeOptions = {
    palette: {
        mode: "dark",
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
            default: "#0F172A",
            paper: "#1E293B",
        },
        text: {
            primary: "#F1F5F9",
            secondary: "#CBD5E1",
        },
        divider: "#334155",
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
