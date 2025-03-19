import { useState } from "react";
import { Container, Typography, Tabs, Tab } from "@mui/material";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SearchBooks from "./components/SearchBooks";
import Library from "./components/Library";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pt: 2, pb: 4, alignSelf: "flex-start" }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Open Books
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Search" />
          <Tab label="My Library" />
        </Tabs>

        {activeTab === 0 && <SearchBooks />}

        {activeTab === 1 && <Library />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
