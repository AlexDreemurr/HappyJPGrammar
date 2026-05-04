import React from "react";
import supabase from "../supabaseClient";

function usePhraseSets() {
  const [phraseSets, setPhraseSets] = React.useState([]);
  const [status, setStatus] = React.useState("free");

  React.useEffect(() => {
    setStatus("busy");
    async function fetchPhraseSets() {
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
    }

    fetchPhraseSets();
  }, []);

  return { phraseSets, status };
}

export default usePhraseSets;
