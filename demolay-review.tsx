import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Lock, CheckCircle2, Eye } from "lucide-react";

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

export default function Landing() {
  const [auth, setAuth] = useState(null);
  const [reviewedMembers, setReviewedMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("reviewToken");
    if (!token) { window.location.href = "/api/auth/google"; return; }
    try {
      const res = await fetch("/api/auth/me", { headers: { "X-Review-Token": token } });
      const data = await res.json();
      if (data.authenticated) {
        setAuth(data);
        await loadReviewedMembers(token);
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
    setLoading(false);
  };

  const loadReviewedMembers = async (token) => {
    const reviewed = [];
    for (const member of members) {
      try {
        const res = await fetch(`/api/reviews/submit?memberId=${member.id}`, { headers: { "X-Review-Token": token } });
        const data = await res.json();
        if (data.alreadyReviewed) {
          reviewed.push(member.id);
        }
      } catch {}
    }
    setReviewedMembers(reviewed);
  };

  const handleLogout = () => { localStorage.removeItem("reviewToken"); window.location.href = "https://accounts.google.com/logout"; };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}><div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full" /></div>;

  const userEmail = auth?.email?.toLowerCase() || "";
  const selfMember = members.find(m => m.email.toLowerCase() === userEmail);
  const remainingCount = members.length - reviewedMembers.length - (selfMember ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
      <div style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }} className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-white">Arizona DeMolay 360° Review</h1>
          <p className="text-center mt-2 text-white opacity-90">State Association Member Evaluation</p>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: AZ_GOLD, color: AZ_BLUE }}>{auth?.name?.[0]}</div>
            <div><p className="font-semibold" style={{ color: AZ_BLUE }}>{auth?.name}</p><p className="text-sm" style={{ color: AZ_COPPER }}>{auth?.email}</p></div>
          </div>
          <div className="flex gap-3">
            <Link to="/demolay-review/results" className="px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2" style={{ background: "#16a34a" }}><Eye className="w-4 h-4" />View Results</Link>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ background: AZ_RED }}>Logout</button>
          </div>
        </div>

        {remainingCount === 0 ? (
          <div className="mb-8 p-6 rounded-xl text-center" style={{ background: "rgba(34,197,94,0.1)", border: "2px solid #22c55e" }}>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-xl font-bold mb-2" style={{ color: AZ_BLUE }}>All Reviews Complete!</p>
            <p className="mb-4" style={{ color: AZ_COPPER }}>You have reviewed all available members.</p>
            <Link to="/demolay-review/results" className="inline-block px-6 py-3 rounded-lg font-semibold text-white" style={{ background: AZ_BLUE }}>View Results</Link>
          </div>
        ) : (
          <p className="text-center mb-6 text-lg" style={{ color: AZ_BLUE }}>
            <span className="font-bold">{remainingCount}</span> member{remainingCount !== 1 ? "s" : ""} remaining to review
          </p>
        )}

        {selfMember && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border-l-4 border-red-500">
            <p className="font-semibold text-red-700">Self-review disabled: You cannot review yourself</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            const isSelf = member.id === selfMember?.id;
            const isReviewed = reviewedMembers.includes(member.id);

            if (isSelf) {
              return (
                <div key={member.id} className="rounded-xl p-4 bg-gray-200 border-2 border-dashed border-gray-400 opacity-70">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-400"><Lock className="w-6 h-6 text-gray-600" /></div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">SELF</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-600">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.title}</p>
                  <p className="text-xs text-gray-500 mt-2">Cannot review yourself</p>
                </div>
              );
            }

            if (isReviewed) {
              return (
                <div key={member.id} className="rounded-xl p-4 bg-green-50 border-2 border-green-500 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">COMPLETED</span>
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: AZ_BLUE }}>{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.title}</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">Review submitted</p>
                </div>
              );
            }

            return (
              <Link key={member.id} to={`/review/${member.id}`} className="rounded-xl p-4 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl" style={{ border: "2px solid transparent" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: AZ_GOLD, color: AZ_BLUE }}>
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: AZ_GOLD, color: AZ_BLUE }}>PENDING</span>
                </div>
                <h3 className="font-semibold text-lg" style={{ color: AZ_BLUE }}>{member.name}</h3>
                <p className="text-sm text-gray-600">{member.title}</p>
                <div className="flex items-center gap-1 text-sm mt-2" style={{ color: AZ_GOLD }}>
                  <Star className="w-4 h-4 fill-current" />
                  <span>Click to review</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
