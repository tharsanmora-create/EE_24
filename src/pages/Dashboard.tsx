import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { useAuth } from "../contexts/auth-context";
import { supabaseClient } from "../integrations/supabase/client";

const subjects = [
  {
    id: "cs2833",
    name: "Modular Software Development",
    code: "CS2833",
    tag: "Eng-CSE",
    cover: "bg-[linear-gradient(135deg,rgba(0,255,214,0.35),rgba(0,132,255,0.15))]",
  },
  {
    id: "ee2024",
    name: "Electrical Machines in Power Systems",
    code: "EE2024",
    tag: "Eng-EE",
    cover: "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),rgba(255,255,255,0))]",
  },
  {
    id: "ee2044",
    name: "Electrical Measurements and Instrumentation",
    code: "EE2044",
    tag: "Eng-EE",
    cover: "bg-[linear-gradient(135deg,rgba(0,210,255,0.25),rgba(0,140,255,0.05))]",
  },
  {
    id: "ee2054",
    name: "Control Systems",
    code: "EE2054",
    tag: "Eng-EE",
    cover: "bg-[linear-gradient(135deg,rgba(0,255,214,0.2),rgba(0,255,214,0.05))]",
  },
  {
    id: "ee3074",
    name: "Electrical Installations",
    code: "EE3074",
    tag: "Eng-EE",
    cover: "bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.1))]",
  },
  {
    id: "ma3014",
    name: "Applied Statistics",
    code: "MA3014",
    tag: "Eng-MATH",
    cover: "bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),rgba(255,255,255,0))]",
  },
  {
    id: "ma3024",
    name: "Numerical Methods",
    code: "MA3024",
    tag: "Eng-MATH",
    cover: "bg-[linear-gradient(135deg,rgba(0,210,255,0.2),rgba(0,140,255,0.1))]",
  },
  {
    id: "cs2023",
    name: "Data Structures and Algorithms",
    code: "CS2023",
    tag: "Eng-CSE",
    cover: "bg-[linear-gradient(135deg,rgba(255,91,216,0.18),rgba(138,77,255,0.12))]",
  },
  {
    id: "ma2034",
    name: "Linear Algebra",
    code: "MA2034",
    tag: "Eng-MATH",
    cover: "bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(0,210,255,0.10))]",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [latestByModule, setLatestByModule] = useState<Record<string, string | null>>({});

  const moduleSources: Record<string, { tableName: string }> = {
    cs2833: { tableName: "msd_uploads" },
    ee2024: { tableName: "ee2024_uploads" },
    ee2044: { tableName: "ee2044_uploads" },
    ee2054: { tableName: "ee2054_uploads" },
    ee3074: { tableName: "ee3074_uploads" },
    ma3014: { tableName: "ma3014_uploads" },
    ma3024: { tableName: "ma3024_uploads" },
    cs2023: { tableName: "cs2023_uploads" },
    ma2034: { tableName: "ma2034_uploads" },
  };

  useEffect(() => {
    let isMounted = true;
    const loadLatest = async () => {
      const entries = await Promise.all(
        Object.entries(moduleSources).map(async ([moduleId, { tableName }]) => {
          const { data, error } = await supabaseClient
            .from(tableName)
            .select("uploaded_at")
            .order("uploaded_at", { ascending: false })
            .limit(1);
          if (error || !data || data.length === 0) {
            return [moduleId, null] as const;
          }
          return [moduleId, data[0].uploaded_at as string] as const;
        })
      );
      if (isMounted) {
        setLatestByModule(Object.fromEntries(entries));
      }
    };
    loadLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  const orderedSubjects = useMemo(() => {
    return subjects
      .map((subject, index) => ({ ...subject, _index: index }))
      .sort((a, b) => {
        const aTime = latestByModule[a.id];
        const bTime = latestByModule[b.id];
        if (aTime && bTime) {
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        }
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;
        return a._index - b._index;
      });
  }, [latestByModule]);

  const filteredSubjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orderedSubjects;
    return orderedSubjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(term) ||
        subject.code.toLowerCase().includes(term) ||
        subject.tag.toLowerCase().includes(term)
    );
  }, [orderedSubjects, query]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <input
            className="btn-secondary text-left w-full py-3 px-4 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
            placeholder="Search modules by code, name, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <Link key={subject.id} to={`/subjects/${subject.id}`}>
              <Card className="h-full subject-card transition-transform duration-150 active:scale-95 focus-within:scale-95">
                <div className={`subject-cover ${subject.cover}`}>
                  <span className="subject-tag">{subject.tag}</span>
                </div>
                <CardContent>
                  <p className="text-xs text-white/60">{subject.code}</p>
                  <h3 className="font-semibold text-base mt-1">{subject.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredSubjects.length === 0 && (
            <div className="glass-card p-4 text-sm text-white/60 col-span-full">
              No modules found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
