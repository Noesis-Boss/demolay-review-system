import { useState, useEffect } from "react";
import { FileDown, Users } from "lucide-react";

const AZ_BLUE = "#002868";
const AZ_RED = "#BF0A30";
const AZ_GOLD = "#FFD700";
const AZ_COPPER = "#C47A6B";

const members = [
  { id: "steve-johnston", name: "Dad Steve Johnston", title: "Executive Officer", email: "executive.officer@azdemolay.org" },
  { id: "don-lowery", name: "Dad Don Lowery", title: "State Dad", email: "state.officer.director@azdemolay.org" },
  { id: "bill-enloe", name: "Dad Bill Enloe", title: "State Membership Advisor", email: "membership@azdemolay.org" },
  { id: "seth-baldwin", name: "SMC Seth Baldwin", title: "State Master Councilor", email: "smc@azdemolay.org" },
  { id: "kaden-hartley", name: "DSMC Kaden Hartley", title: "Deputy State Master Councilor", email: "dsmc@azdemolay.org" },
  { id: "cooper-pitman", name: "SSC Cooper Pitman", title: "State Senior Councilor", email: "ssc@azdemolay.org" },
  { id: "john-enloe", name: "SJC John Enloe", title: "State Junior Councilor", email: "sjc@azdemolay.org" },
  { id: "james-hendrickson", name: "Scribe James Hendrickson", title: "State Scribe", email: "scribe@azdemolay.org" },
];

export default function Results() {
  const [auth, setAuth] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        fetchReviews(token);
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch (err) {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
  };

  const fetchReviews = async (token: string) => {
    try {
      const res = await fetch("/api/reviews/export", {
        headers: { "X-Review-Token": token },
      });
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewToken");
    window.location.href = "https://accounts.google.com/logout?continue=https://jaknyfe.zo.space/api/auth/google";
  };

  const exportCSV = () => {
    const headers = ["Reviewer", "Member", "Leadership", "Teamwork", "Attendance", "Punctuality", "Motivation", "Ritual Work", "Initiative", "Planning", "Comments"];
    const rows = reviews.map((r) => [
      r.reviewerEmail,
      members.find(m => m.id === r.memberId)?.name || r.memberId,
      r.ratings.leadership,
      r.ratings.teamwork,
      r.ratings.attendance,
      r.ratings.punctuality,
      r.ratings.motivation,
      r.ratings.ritualWork,
      r.ratings.initiative,
      r.ratings.planning,
      `"${r.comments || ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demolay-reviews.csv";
    a.click();
  };

  if (loading || !auth) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20 0%, ${AZ_RED}20 50%, ${AZ_GOLD}15 100%)` }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: AZ_GOLD, borderTopColor: "transparent" }} />
            <p className="text-lg" style={{ color: AZ_BLUE }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20 0%, ${AZ_RED}20 50%, ${AZ_GOLD}15 100%)` }}>
      <div className="py-6" style={{ background: `linear-gradient(135deg, ${AZ_BLUE} 0%, ${AZ_RED} 100%)` }}>
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-white" style={{ textShadow: `2px 2px 4px rgba(0,0,0,0.5)` }}>
            Review Results
          </h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {auth.picture ? (
              <img src={auth.picture} alt="Profile" className="w-10 h-10 rounded-full border-2" style={{ borderColor: AZ_GOLD }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: AZ_GOLD, color: AZ_BLUE }}>
                {auth.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg" style={{ color: AZ_BLUE }}>{auth.name}</p>
              <p className="text-sm" style={{ color: AZ_COPPER }}>{auth.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
              style={{ background: AZ_BLUE }}
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold text-white"
              style={{ background: AZ_RED }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: AZ_BLUE }}>
            <Users className="w-5 h-5" />
            All Reviews ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <p className="text-center py-8" style={{ color: AZ_COPPER }}>No reviews found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: AZ_BLUE }}>
                    <th className="px-4 py-3 text-left text-white font-semibold">Reviewer</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Member</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">L</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">T</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">A</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">P</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">M</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">R</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">I</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">Pl</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review, idx) => (
                    <tr key={idx} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                      <td className="px-4 py-3" style={{ color: AZ_BLUE }}>{review.reviewerEmail}</td>
                      <td className="px-4 py-3" style={{ color: AZ_BLUE }}>
                        {members.find(m => m.id === review.memberId)?.name || review.memberId}
                      </td>
                      {Object.values(review.ratings).map((rating: any, ridx) => (
                        <td key={ridx} className="px-4 py-3 text-center font-semibold" style={{ color: AZ_BLUE }}>
                          {rating}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
