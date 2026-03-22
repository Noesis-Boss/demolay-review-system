import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ArrowLeft, CheckCircle, Lock } from "lucide-react";

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

const attributes = [
  { key: "leadership", label: "Leadership" },
  { key: "teamwork", label: "Teamwork" },
  { key: "attendance", label: "Attendance" },
  { key: "punctuality", label: "Punctuality" },
  { key: "motivation", label: "Motivation" },
  { key: "ritualWork", label: "Ritual Work" },
  { key: "initiative", label: "Initiative" },
  { key: "planning", label: "Planning" },
];

export default function ReviewForm() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  const member = members.find(m => m.id === memberId);

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
      const res = await fetch("/api/auth/me", { headers: { "X-Review-Token": token } });
      const data = await res.json();
      if (data.authenticated) {
        setAuth(data);
        const userEmail = data.email?.toLowerCase() || "";
        const selfMember = members.find(m => m.email.toLowerCase() === userEmail);
        if (selfMember && selfMember.id === memberId) {
          setIsSelf(true);
        }
        const checkRes = await fetch(`/api/reviews/submit?memberId=${memberId}`, { headers: { "X-Review-Token": token } });
        const checkData = await checkRes.json();
        if (checkData.alreadyReviewed) setSubmitted(true);
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

  const handleRating = (attribute: string, value: number) => {
    setRatings(prev => ({ ...prev, [attribute]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(ratings).length < attributes.length) {
      alert("Please rate all attributes");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("reviewToken");
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Review-Token": token || "" },
        body: JSON.stringify({ memberId, ratings, comments }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Failed to submit");
    } catch {
      alert("Network error");
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewToken");
    window.location.href = "https://accounts.google.com/logout";
  };

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
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link to="/demolay-review" className="flex items-center gap-2 text-white hover:opacity-90"><ArrowLeft className="w-5 h-5" />Back</Link>
          <h1 className="text-2xl font-bold text-white">360° Review</h1>
          <button onClick={handleLogout} className="text-white hover:opacity-90 font-semibold">Logout</button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2" style={{ color: AZ_BLUE }}>{member?.name}</h2>
          <p className="text-lg mb-4" style={{ color: AZ_COPPER }}>{member?.title}</p>
        </div>

        {isSelf ? (
          <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-red-700">Self-Review Disabled</h3>
            </div>
            <p className="text-red-600 mb-6">You cannot review yourself. Please select another member to review.</p>
            <Link to="/demolay-review" className="inline-block px-6 py-3 rounded-lg text-white font-semibold" style={{ background: AZ_BLUE }}>Back to Members</Link>
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: AZ_BLUE }}>Review Submitted!</h2>
            <p className="mb-6" style={{ color: AZ_COPPER }}>Thank you for reviewing {member?.name}.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/demolay-review" className="px-6 py-2 rounded-lg text-white font-semibold" style={{ background: AZ_BLUE }}>Back to Members</Link>
              <button onClick={handleLogout} className="px-6 py-2 rounded-lg text-white font-semibold" style={{ background: AZ_RED }}>Logout</button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {attributes.map((attr) => (
                <div key={attr.key} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg" style={{ color: AZ_BLUE }}>{attr.label}</h3>
                    <span className="text-2xl font-bold" style={{ color: AZ_GOLD }}>{ratings[attr.key] || "-"}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRating(attr.key, value)}
                        className={`w-12 h-12 rounded-lg font-bold transition-all ${ratings[attr.key] === value ? "text-white scale-110" : "bg-gray-100 hover:bg-gray-200"}`}
                        style={{ background: ratings[attr.key] === value ? AZ_BLUE : undefined }}
                      >{value}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 mt-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-4" style={{ color: AZ_BLUE }}>Additional Comments</h3>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-4 border-2 rounded-lg"
                rows={4}
                placeholder="Enter any additional feedback..."
                style={{ borderColor: AZ_GOLD }}
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Link to="/demolay-review" className="flex-1 py-3 rounded-lg font-semibold border-2 text-center" style={{ borderColor: AZ_BLUE, color: AZ_BLUE }}>Cancel</Link>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(ratings).length < attributes.length}
                className="flex-1 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                style={{ background: AZ_BLUE }}
              >{submitting ? "Submitting..." : "Submit Review"}</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
