import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Users, Eye } from "lucide-react";

// Arizona Flag Colors
const AZ_BLUE = "#002868";
const AZ_RED = "#BF0A30";
const AZ_GOLD = "#FFD700";
const AZ_COPPER = "#B87333";

const members = [
  { id: "steve-johnston", name: "Dad Steve Johnston", title: "Executive Officer", email: "executive.officer@azdemolay.org" },
  { id: "don-lowery", name: "Dad Don Lowery", title: "State Dad", email: "state.officer.director@azdemolay.org" },
  { id: "bill-enloe", name: "Dad Bill Enloe", title: "State Membership Advisor", email: "membership.advisor@azdemolay.org" },
  { id: "seth-baldwin", name: "SMC Seth Baldwin", title: "State Master Councilor", email: "smc@azdemolay.org" },
  { id: "kaden-hartley", name: "DSMC Kaden Hartley", title: "Deputy State Master Councilor", email: "dsmc@azdemolay.org" },
  { id: "cooper-pitman", name: "SSC Cooper Pitman", title: "State Senior Councilor", email: "ssc@azdemolay.org" },
  { id: "john-enloe", name: "SJC John Enloe", title: "State Junior Councilor", email: "sjc@azdemolay.org" },
  { id: "james-hendrickson", name: "Scribe James Hendrickson", title: "State Scribe", email: "scribe@azdemolay.org" },
];

const attributes = ["leadership", "teamwork", "attendance", "punctuality", "motivation", "ritualWork", "initiative", "planning"];

const DadEmails = [
  "executive.officer@azdemolay.org",
  "state.officer.director@azdemolay.org",
  "membership.advisor@azdemolay.org",
];

export default function Results() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "youth">("all");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("reviewToken");
    if (!token) {
      window.location.href = "/api/auth/google";
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "X-Review-Token": token },
      });
      const data = await res.json();

      if (data.authenticated) {
        setAuth(data);
        const isDad = DadEmails.includes(data.email?.toLowerCase());
        // Default to youth view for youth officers, all view for dads
        setViewMode(isDad ? "all" : "youth");
        loadReviews(token);
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch (err) {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
  };

  const loadReviews = async (token: string) => {
    try {
      const res = await fetch("/api/reviews/export", {
        headers: { "X-Review-Token": token },
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewToken");
    const googleLogoutUrl = `https://accounts.google.com/logout?continue=${encodeURIComponent("https://jaknyfe.zo.space/api/auth/google?prompt=select_account")}`;
    window.location.href = googleLogoutUrl;
  };

  const exportToCSV = () => {
    if (!reviews.length) return;

    const headers = ["Reviewer", "Member", "Leadership", "Teamwork", "Attendance", "Punctuality", "Motivation", "Ritual Work", "Initiative", "Planning", "Comments", "Date"];
    const rows = reviews.map((r: any) => [
      r.reviewerEmail,
      r.memberId,
      r.ratings.leadership,
      r.ratings.teamwork,
      r.ratings.attendance,
      r.ratings.punctuality,
      r.ratings.motivation,
      r.ratings.ritualWork,
      r.ratings.initiative,
      r.ratings.planning,
      `"${(r.comments || "").replace(/"/g, """)}"`,
      new Date(r.timestamp).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demolay-reviews-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const calculateAverages = () => {
    if (!reviews.length) return {};

    const memberStats: Record<string, { ratings: number[]; count: number; name: string }> = {};

    reviews.forEach((review: any) => {
      if (!memberStats[review.memberId]) {
        const member = members.find(m => m.id === review.memberId);
        memberStats[review.memberId] = { ratings: [], count: 0, name: member?.name || review.memberId };
      }
      const totalRating = attributes.reduce((sum, attr) => sum + (review.ratings[attr] || 0), 0);
      memberStats[review.memberId].ratings.push(totalRating);
      memberStats[review.memberId].count++;
    });

    return Object.entries(memberStats).map(([id, stats]) => ({
      id,
      name: stats.name,
      average: (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length / 8).toFixed(2),
      count: stats.count,
    }));
  };

  const getYouthReviews = () => {
    if (!auth) return [];
    return reviews.filter((r: any) => r.memberId === auth.email?.split("@")[0].replace(/\./g, "-") ||
      members.find(m => m.email.toLowerCase() === auth.email?.toLowerCase())?.id === r.memberId);
  };

  const averages = calculateAverages();
  const isDad = auth && DadEmails.includes(auth.email?.toLowerCase());
  const youthReviews = getYouthReviews();
  const displayReviews = viewMode === "youth" ? youthReviews : reviews;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
      <div style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }} className="py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/demolay-review")}
            className="flex items-center gap-2 text-white hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Review Results</h1>
          <button
            onClick={handleLogout}
            className="text-white hover:opacity-90 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="font-semibold" style={{ color: AZ_BLUE }}>{auth?.name}</p>
            <p className="text-sm" style={{ color: AZ_COPPER }}>{auth?.email}</p>
          </div>
          {isDad && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-lg font-semibold ${viewMode === "all" ? "text-white" : ""}`}
                style={{ background: viewMode === "all" ? AZ_BLUE : "#e5e7eb", color: viewMode === "all" ? "white" : AZ_BLUE }}
              >
                <Users className="w-4 h-4 inline mr-2" />
                All Reviews
              </button>
              <button
                onClick={() => setViewMode("youth")}
                className={`px-4 py-2 rounded-lg font-semibold ${viewMode === "youth" ? "text-white" : ""}`}
                style={{ background: viewMode === "youth" ? AZ_BLUE : "#e5e7eb", color: viewMode === "youth" ? "white" : AZ_BLUE }}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View as SMC
              </button>
            </div>
          )}
        </div>

        {viewMode === "all" && isDad && (
          <>
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4" style={{ color: AZ_BLUE }}>Average Ratings by Member</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: AZ_BLUE }}>
                      <th className="p-3 text-left text-white">Member</th>
                      <th className="p-3 text-center text-white">Avg Score</th>
                      <th className="p-3 text-center text-white">Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {averages.map((avg: any) => (
                      <tr key={avg.id} className="border-b">
                        <td className="p-3 font-semibold" style={{ color: AZ_BLUE }}>{avg.name}</td>
                        <td className="p-3 text-center font-bold" style={{ color: AZ_GOLD }}>{avg.average}</td>
                        <td className="p-3 text-center">{avg.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={exportToCSV}
                disabled={!reviews.length}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ background: AZ_BLUE }}
              >
                <Download className="w-4 h-4" />
                Export to CSV
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4" style={{ color: AZ_BLUE }}>Individual Reviews</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: AZ_BLUE }}>
                      <th className="p-3 text-left text-white">Reviewer</th>
                      <th className="p-3 text-left text-white">Member</th>
                      <th className="p-3 text-center text-white">L</th>
                      <th className="p-3 text-center text-white">T</th>
                      <th className="p-3 text-center text-white">A</th>
                      <th className="p-3 text-center text-white">P</th>
                      <th className="p-3 text-center text-white">M</th>
                      <th className="p-3 text-center text-white">R</th>
                      <th className="p-3 text-center text-white">I</th>
                      <th className="p-3 text-center text-white">Pl</th>
                      <th className="p-3 text-left text-white">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3 text-sm">{review.reviewerEmail}</td>
                        <td className="p-3 font-semibold" style={{ color: AZ_BLUE }}>
                          {members.find(m => m.id === review.memberId)?.name || review.memberId}
                        </td>
                        {attributes.map(attr => (
                          <td key={attr} className="p-3 text-center">{review.ratings[attr]}</td>
                        ))}
                        <td className="p-3 text-sm max-w-xs truncate">{review.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {(viewMode === "youth" || !isDad) && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4" style={{ color: AZ_BLUE }}>Reviews About You</h2>
            {youthReviews.length === 0 ? (
              <p className="text-gray-600">No reviews found for your account.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: AZ_BLUE }}>
                      <th className="p-3 text-left text-white">Reviewer</th>
                      <th className="p-3 text-center text-white">L</th>
                      <th className="p-3 text-center text-white">T</th>
                      <th className="p-3 text-center text-white">A</th>
                      <th className="p-3 text-center text-white">P</th>
                      <th className="p-3 text-center text-white">M</th>
                      <th className="p-3 text-center text-white">R</th>
                      <th className="p-3 text-center text-white">I</th>
                      <th className="p-3 text-center text-white">Pl</th>
                      <th className="p-3 text-left text-white">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {youthReviews.map((review: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3 text-sm">{review.reviewerEmail}</td>
                        {attributes.map(attr => (
                          <td key={attr} className="p-3 text-center">{review.ratings[attr]}</td>
                        ))}
                        <td className="p-3 text-sm max-w-xs truncate">{review.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
