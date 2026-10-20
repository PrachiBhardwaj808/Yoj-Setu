import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("yojsetu_theme");
        const initialTheme = savedTheme === "dark" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", initialTheme === "dark");
        return initialTheme;
    });

    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("yojsetu_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
