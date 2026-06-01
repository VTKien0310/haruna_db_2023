module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#154EC1",
        secondary: "#767C88",
        success: "#3D9209",
        info: "#158DE3",
        danger: "#E42222",
        warning: "#FFD43A",
        "background-primary": "#f6f6f6",
        "background-secondary": "#FFFFFF",
        "background-element": "#ECF0F1",
        "background-border": "#DEE5F2",
        "text-primary": "#262824",
        "text-inverted": "#FFFFFF",
        shadow: "rgba(0, 0, 0, 0.12)",
        focus: "#49A8FF",
      },
      screens: {
        xs: "0px",
        sm: "640px",
        md: "1024px",
        lg: "1440px",
        xl: "1920px",
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
        20: "repeat(20, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
