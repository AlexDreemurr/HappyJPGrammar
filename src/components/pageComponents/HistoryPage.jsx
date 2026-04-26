import HistoryQuizes from "../HistoryQuizes";
import styled from "styled-components";
import React from "react";

function HistoryPage({ historyQuizes }) {
  return (
    <Main>
      <HistoryQuizes historyQuizes={historyQuizes} />
    </Main>
  );
}

const Main = styled.main`
  padding: 2rem 1.5rem;
  max-width: 800px;
`;
export default HistoryPage;
