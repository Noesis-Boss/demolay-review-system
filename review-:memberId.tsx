import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, ArrowLeft, Save, Lock } from "lucide-react";

const AZ_BLUE = "#002868";
const AZ_RED = "#BF0A30";
const AZ_GOLD = "#FFD700";

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
  { id: "leadership", label: "Leadership" },
  { id: "teamwork", label: "Teamwork" },
  { id: "attendance", label: "Attendance" },
  { id: "punctuality", label: "Punctuality" },
  { id: "motivation", label: "Motivation" },
  { id: "ritualWork", label: "Ritual Work" },
  { id: "initiative", label: "Initiative" },
  { id: "planning", label: "Planning" },
];

export default function ReviewForm() {
  const params = useParams();
  const memberId = params.memberId;
  const [auth, setAuth] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [isSelfReview, setIsSelfReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        const foundMember = members.find((m) => m.id === memberId);
        if (foundMember) {
          setMember(foundMember);
          const userEmail = (data.email || "").toLowerCase();
          const selfMember = members.find(m => (m.email || "").toLowerCase() === userEmail);
          if (selfMember && selfMember.id === memberId) {
            setIsSelfReview(true);
          }
        }
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch (err) {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
    setLoading(false);
  };

  const handleRating = (attribute: string, value: number) => {
    setRatings((prev) => ({ ...prev, [attribute]: value }));
  };

  const handleSubmit = async () => {
    if (isSelfReview) {
      alert("You cannot review yourself.");
      return;
    }

    const token = localStorage.getItem("reviewToken");
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Review-Token": token,
        },
        body: JSON.stringify({
          memberId,
          ratings,
          comments,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          window.location.href = "/demolay-review";
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("reviewToken");
    window.location.href = "https://accounts.google.com/logout?continue=https://jaknyfe.zo.space/api/auth/google";
  };

  if (loading || !auth || !member) {
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

  if (isSelfReview) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20 0%, ${AZ_RED}20 50%, ${AZ_GOLD}15 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: AZ_RED }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: AZ_BLUE }}>Self-Review Not Allowed</h1>
            <p className="mb-4" style={{ color: AZ_COPPER }}>You cannot review yourself.</p>
            <a href="/demolay-review" className="inline-block px-6 py-3 rounded-lg font-semibold text-white" style={{ background: AZ_BLUE }}>
              Return to Members
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20 0%, ${AZ_RED}20 50%, ${AZ_GOLD}15 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: AZ_BLUE }}>Review Submitted!</h1>
            <p style={{ color: AZ_COPPER }}>Thank you for your feedback.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20 0%, ${AZ_RED}20 50%, ${AZ_GOLD}15 100%)` }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <a href="/demolay-review" className="flex items-center gap-2 font-semibold" style={{ color: AZ_BLUE }}>
            <ArrowLeft className="w-5 h-5" />
            Back to Members
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-semibold text-white"
            style={{ background: AZ_RED }}
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl" style={{ background: AZ_GOLD, color: AZ_BLUE }}>
              {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: AZ_BLUE }}>{member.name}</h1>
              <p style={{ color: AZ_COPPER }}>{member.title}</p>
            </div>
          </div>

          <div className="space-y-6">
            {attributes.map((attr) => (
              <div key={attr.id}>
                <label className="block font-semibold mb-2" style={{ color: AZ_BLUE }}>{attr.label}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(attr.id, value)}
                      className="w-12 h-12 rounded-lg font-bold transition-all"
                      style={{
                        background: ratings[attr.id] === value ? AZ_GOLD : "#e5e7eb",
                        color: ratings[attr.id] === value ? AZ_BLUE : "#6b7280",
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label className="block font-semibold mb-2" style={{ color: AZ_BLUE }}>Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-4 rounded-lg border-2 min-h-[120px]"
              style={{ borderColor: "#e5e7eb" }}
              placeholder="Enter your comments..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(ratings).length < attributes.length}
            className="mt-8 w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: AZ_BLUE }}
          >
            <Save className="w-5 h-5" />
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
