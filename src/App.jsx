import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyles from "./GlobalStyles";

/* Page Components */
import QuizPage from "./components/pageComponents/QuizPage";
import StartPage from "./components/pageComponents/StartPage";
import HistoryPage from "./components/pageComponents/HistoryPage";
import PhraseSetPage from "./components/pageComponents/PhraseSetPage";
import SettingsPage from "./components/pageComponents/SettingsPage";

/* Components */
import Header from "./components/Header";
import styled from "styled-components";
import ContributeForm from "./components/ContributeForm";
import { KatakanaRateContext } from "./KatakanaRateContext";

function App() {
  const [historyQuizes, setHistoryQuizes] = React.useState(() => {
    return JSON.parse(window.localStorage.getItem("historyQuizes") ?? "[]");
  });
  const [katakanaRate, setKatakanaRate] = React.useState(() => {
    const storedRate = parseFloat(
      window.localStorage.getItem("katakanaRate") ?? 0.5
    );

    if (Number.isNaN(storedRate)) {
      return 0.5;
    }

    return Math.min(Math.max(storedRate, 0), 1);
  });

  React.useEffect(() => {
    window.localStorage.setItem("katakanaRate", String(katakanaRate));
  }, [katakanaRate]);

  return (
    <KatakanaRateContext.Provider value={{ katakanaRate, setKatakanaRate }}>
      <BrowserRouter basename="/HappyJPGrammar/">
        <Root>
          <Header />
          <HelperBox />
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route
              path="/quiz/grammar"
              element={
                <QuizPage
                  source="grammar"
                  historyQuizes={historyQuizes}
                  setHistoryQuizes={setHistoryQuizes}
                />
              }
            />
            <Route
              path="/quiz/sharedDict"
              element={
                <QuizPage
                  source="sharedDict"
                  historyQuizes={historyQuizes}
                  setHistoryQuizes={setHistoryQuizes}
                />
              }
            />
            <Route
              path="/history"
              element={<HistoryPage historyQuizes={historyQuizes} />}
            />
            <Route path="/contribute" element={<ContributeForm />} />
            <Route path="/phraseSetList" element={<PhraseSetPage />} />
            <Route path="/phraseSet/:phraseSetId" element={<PhraseSetPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <HelperBox />
        </Root>

        <GlobalStyles />
      </BrowserRouter>
    </KatakanaRateContext.Provider>
  );
}

const HelperBox = styled.div`
  flex: 1;
  width: 100%;
  min-height: 4rem;
`;
const Root = styled.div`
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Main = styled.main`
  padding: 2rem 1.5rem;
  max-width: 800px;
`;

export default App;
