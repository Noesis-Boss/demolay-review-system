import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileDown, Users, Eye } from "lucide-react";

const AZ_BLUE = "#002868";
const AZ_RED = "#BF0A30";
const AZ_GOLD = "#FFD700";

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

const DAD_EMAILS = ["executive.officer@azdemolay.org", "state.officer.director@azdemolay.org", "membership.advisor@azdemolay.org"];

export default function Results() {
  const [auth, setAuth] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewAsYouth, setViewAsYouth] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("reviewToken");
    if (!token) { window.location.href = "/api/auth/google"; return; }
    try {
      const res = await fetch("/api/auth/me", { headers: { "X-Review-Token": token } });
      const data = await res.json();
      if (data.authenticated) {
        setAuth(data);
        const isDad = DAD_EMAILS.includes(data.email?.toLowerCase());
        setViewAsYouth(!isDad);
        loadReviews(token);
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
  };

  const loadReviews = async (token) => {
    try {
      const res = await fetch("/api/reviews/export", { headers: { "X-Review-Token": token } });
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem("reviewToken"); window.location.href = "https://accounts.google.com/logout"; };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}><div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full" /></div>;

  const userEmail = auth?.email?.toLowerCase() || "";
  const isDad = DAD_EMAILS.includes(userEmail);
  const selfMember = members.find(m => m.email.toLowerCase() === userEmail);

  const displayReviews = isDad && !viewAsYouth ? reviews : selfMember ? reviews.filter(r => r.memberId === selfMember.id) : [];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
      <div style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }} className="py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link to="/demolay-review" className="flex items-center gap-2 text-white hover:opacity-90"><ArrowLeft className="w-5 h-5" />Back</Link>
          <h1 className="text-2xl font-bold text-white">Review Results</h1>
          <button onClick={handleLogout} className="text-white hover:opacity-90 font-semibold">Logout</button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isDad && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setViewAsYouth(false)} className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${!viewAsYouth ? "text-white bg-blue-900" : "text-blue-900 bg-gray-200"}`}><Users className="w-4 h-4" />All</button>
            <button onClick={() => setViewAsYouth(true)} className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${viewAsYouth ? "text-white bg-blue-900" : "text-blue-900 bg-gray-200"}`}><Eye className="w-4 h-4" />View as SMC</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-blue-900 text-white"><th className="px-4 py-3 text-left">Member</th><th className="px-4 py-3 text-center">Leadership</th><th className="px-4 py-3 text-center">Teamwork</th><th className="px-4 py-3 text-center">Attendance</th><th className="px-4 py-3 text-center">Punctuality</th><th className="px-4 py-3 text-center">Motivation</th><th className="px-4 py-3 text-center">Ritual</th><th className="px-4 py-3 text-center">Initiative</th><th className="px-4 py-3 text-center">Planning</th></tr></thead>
            <tbody>
              {displayReviews.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-blue-900">{members.find(m => m.id === r.memberId)?.name || r.memberId}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.leadership}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.teamwork}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.attendance}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.punctuality}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.motivation}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.ritualWork}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.initiative}</td>
                  <td className="px-4 py-3 text-center">{r.ratings.planning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
