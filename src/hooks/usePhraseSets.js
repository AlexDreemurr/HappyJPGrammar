import React from "react";
import supabase from "../supabaseClient";

function usePhraseSets() {
  const [phraseSets, setPhraseSets] = React.useState([]);
  const [status, setStatus] = React.useState("free");

  const fetchPhraseSets = React.useCallback(async () => {
    setStatus("busy");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setStatus("error");
      return;
    }

    const user = session?.user ?? null;

    let memberSetIds = [];
    if (user) {
      const { data: memberships, error: membershipError } = await supabase
        .from("set_members")
        .select("set_id")
        .eq("user_id", user.id);

      if (membershipError) {
        setStatus("error");
        return;
      }

      memberSetIds = memberships.map((membership) => membership.set_id);
    }

    let query = supabase
      .from("vocabulary_sets")
      .select("*, vocabulary(count)");

    if (memberSetIds.length > 0) {
      query = query.or(`privacy.eq.public,id.in.(${memberSetIds.join(",")})`);
    } else {
      query = query.eq("privacy", "public");
    }

    const { data, error } = await query;

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
