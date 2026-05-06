import React from "react";
import supabase from "../supabaseClient";

function usePhraseSets() {
  const [phraseSets, setPhraseSets] = React.useState([]);
  const [status, setStatus] = React.useState("free");

  const fetchPhraseSets = React.useCallback(async () => {
    setStatus("busy");
    const { data, error } = await supabase
      .from("vocabulary_sets")
      .select("*, vocabulary(count)");

    if (error) {
      setStatus("error");
      return;
    }

    const processed = data.map((set) => ({
      ...set,
      count: set.vocabulary[0].count,
    }));

    setPhraseSets(processed);
    setStatus("ok");
  }, []);

  React.useEffect(() => {
    queueMicrotask(fetchPhraseSets);
  }, [fetchPhraseSets]);

  return { phraseSets, status, refetchPhraseSets: fetchPhraseSets };
}

export default usePhraseSets;
