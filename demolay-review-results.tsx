import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Eye } from "lucide-react";

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

  // Calculate averages per member
  const calculateAverages = () => {
    const memberScores = {};
    
    reviews.forEach(r => {
      if (!memberScores[r.memberId]) {
        memberScores[r.memberId] = {
          leadership: [], teamwork: [], attendance: [], punctuality: [],
          motivation: [], ritualWork: [], initiative: [], planning: [],
          count: 0
        };
      }
      memberScores[r.memberId].leadership.push(r.ratings.leadership);
      memberScores[r.memberId].teamwork.push(r.ratings.teamwork);
      memberScores[r.memberId].attendance.push(r.ratings.attendance);
      memberScores[r.memberId].punctuality.push(r.ratings.punctuality);
      memberScores[r.memberId].motivation.push(r.ratings.motivation);
      memberScores[r.memberId].ritualWork.push(r.ratings.ritualWork);
      memberScores[r.memberId].initiative.push(r.ratings.initiative);
      memberScores[r.memberId].planning.push(r.ratings.planning);
      memberScores[r.memberId].count++;
    });

    // Calculate averages
    const averaged = [];
    for (const [memberId, scores] of Object.entries(memberScores)) {
      const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
      averaged.push({
        memberId,
        memberName: members.find(m => m.id === memberId)?.name || memberId,
        leadership: avg(scores.leadership),
        teamwork: avg(scores.teamwork),
        attendance: avg(scores.attendance),
        punctuality: avg(scores.punctuality),
        motivation: avg(scores.motivation),
        ritualWork: avg(scores.ritualWork),
        initiative: avg(scores.initiative),
        planning: avg(scores.planning),
        reviewCount: scores.count
      });
    }
    
    // Sort by member name
    return averaged.sort((a, b) => a.memberName.localeCompare(b.memberName));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  const userEmail = auth?.email?.toLowerCase() || "";
  const isDad = DAD_EMAILS.includes(userEmail);
  const selfMember = members.find(m => m.email.toLowerCase() === userEmail);

  const averagedReviews = calculateAverages();
  
  // Filter for youth view
  const displayReviews = isDad && !viewAsYouth 
    ? averagedReviews 
    : selfMember 
      ? averagedReviews.filter(r => r.memberId === selfMember.id) 
      : [];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
      <div style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }} className="py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link to="/demolay-review" className="flex items-center gap-2 text-white hover:opacity-90"><ArrowLeft className="w-5 h-5" />Back</Link>
          <h1 className="text-2xl font-bold text-white">Review Results - Average Scores</h1>
          <button onClick={handleLogout} className="text-white hover:opacity-90 font-semibold">Logout</button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isDad && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setViewAsYouth(false)} className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${!viewAsYouth ? "text-white bg-blue-900" : "text-blue-900 bg-gray-200"}`}><Users className="w-4 h-4" />All Members</button>
            <button onClick={() => setViewAsYouth(true)} className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${viewAsYouth ? "text-white bg-blue-900" : "text-blue-900 bg-gray-200"}`}><Eye className="w-4 h-4" />View as Youth</button>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-center">Ldr</th>
                <th className="px-4 py-3 text-center">Team</th>
                <th className="px-4 py-3 text-center">Att</th>
                <th className="px-4 py-3 text-center">Punc</th>
                <th className="px-4 py-3 text-center">Mot</th>
                <th className="px-4 py-3 text-center">Rit</th>
                <th className="px-4 py-3 text-center">Init</th>
                <th className="px-4 py-3 text-center">Plan</th>
                <th className="px-4 py-3 text-center">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {displayReviews.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.memberName}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.leadership}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.teamwork}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.attendance}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.punctuality}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.motivation}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.ritualWork}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.initiative}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.planning}</td>
                  <td className="px-4 py-3 text-center text-slate-900 font-medium">{r.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="mt-4 text-sm text-gray-600">
          <strong>Ldr</strong>=Leadership <strong>Team</strong>=Teamwork <strong>Att</strong>=Attendance <strong>Punc</strong>=Punctuality <strong>Mot</strong>=Motivation <strong>Rit</strong>=Ritual Work <strong>Init</strong>=Initiative <strong>Plan</strong>=Planning
        </p>
      </main>
    </div>
  );
}
