import PhraseSetList from "../PhraseSetList";
import React from "react";
import { useParams } from "react-router-dom";
import PhraseSet from "../PhraseSet";

function PhraseSetPage() {
  const { phraseSetId } = useParams();

  if (phraseSetId) {
    return <PhraseSet phraseSetId={phraseSetId} />;
  }

  return <PhraseSetList />;
}

export default PhraseSetPage;
