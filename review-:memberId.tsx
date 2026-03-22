import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, Lock, LogOut } from "lucide-react";

const AZ_BLUE = "#002868";
const AZ_RED = "#BF0A30";
const AZ_GOLD = "#FFD700";
const AZ_COPPER = "#B87333";

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

export default function ReviewMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [isSelf, setIsSelf] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("reviewToken");
    if (!token) {
      window.location.href = "/api/auth/google";
      return;
    }

    fetch("/api/auth/me", { headers: { "X-Review-Token": token } })
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) {
          localStorage.removeItem("reviewToken");
          window.location.href = "/api/auth/google";
          return;
        }
        setAuth(data);

        const m = members.find(m => m.id === memberId);
        if (!m) {
          navigate("/demolay-review");
          return;
        }
        setMember(m);

        const userEmail = (data.email || "").toLowerCase();
        if ((m.email || "").toLowerCase() === userEmail) {
          setIsSelf(true);
          setLoading(false);
          return;
        }

        return fetch(`/api/reviews/my`, { headers: { "X-Review-Token": token } })
          .then(r => r.json())
          .then(reviewData => {
            if (reviewData.reviews) {
              const existing = reviewData.reviews.find((r: any) => r.memberId === memberId);
              if (existing) {
                setAlreadyReviewed(true);
                setRatings(existing.ratings);
                setComments(existing.comments);
              }
            }
            setLoading(false);
          });
      });
  }, [memberId, navigate]);

  const handleRating = (attr: string, value: number) => {
    setRatings(prev => ({ ...prev, [attr]: value }));
  };

  const handleSubmit = async () => {
    if (isSelf) return;
    
    const missing = attributes.filter(a => !ratings[a.key]);
    if (missing.length > 0) {
      alert(`Please rate all attributes: ${missing.map(m => m.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("reviewToken");

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Review-Token": token || "",
        },
        body: JSON.stringify({ memberId, ratings, comments }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => navigate("/demolay-review"), 1500);
      } else {
        alert("Failed to submit review");
        setSubmitting(false);
      }
    } catch (err) {
      alert("Error submitting review");
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewToken");
    window.location.href = "/demolay-review/logged-out";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}15, ${AZ_RED}15)` }}>
        <p style={{ color: AZ_BLUE }}>Loading...</p>
      </div>
    );
  }

  if (isSelf) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}15, ${AZ_RED}15)` }}>
        <header className="py-6" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-white">Self-Review Disabled</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: AZ_BLUE }}>You cannot review yourself</h2>
          <p className="mb-6" style={{ color: AZ_COPPER }}>Self-evaluation is not allowed. Your performance will be evaluated by other members.</p>
          <Link to="/demolay-review" className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ background: AZ_BLUE }}>
            Return to Members
          </Link>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}15, ${AZ_RED}15)` }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: AZ_BLUE }}>Review Submitted!</h2>
          <p style={{ color: AZ_COPPER }}>Thank you for your feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}15, ${AZ_RED}15)` }}>
      <header className="py-6" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/demolay-review" className="flex items-center gap-2 text-white hover:text-yellow-200">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-white hover:text-yellow-200">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {alreadyReviewed && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-100 border border-yellow-400">
            <p className="font-semibold text-yellow-800">You have already reviewed this member</p>
            <p className="text-sm text-yellow-700">You can update your review below.</p>
          </div>
        )}

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold" style={{ color: AZ_BLUE }}>{member?.name}</h1>
          <p style={{ color: AZ_COPPER }}>{member?.title}</p>
        </div>

        <div className="space-y-6 mb-8">
          {attributes.map((attr) => (
            <div key={attr.key} className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold mb-3" style={{ color: AZ_BLUE }}>{attr.label}</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleRating(attr.key, val)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${ratings[attr.key] === val ? "ring-2" : "hover:bg-gray-100"}`}
                    style={{
                      background: ratings[attr.key] === val ? AZ_GOLD : "#f3f4f6",
                      color: ratings[attr.key] === val ? AZ_BLUE : "#9ca3af",
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="font-semibold mb-3" style={{ color: AZ_BLUE }}>Comments</h3>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your comments (optional)..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: "#e5e7eb", minHeight: "100px" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: AZ_RED }}
        >
          {submitting ? "Submitting..." : alreadyReviewed ? "Update Review" : "Submit Review"}
        </button>
      </main>
    </div>
  );
}
