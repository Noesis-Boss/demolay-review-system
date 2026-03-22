import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Lock, CheckCircle2 } from "lucide-react";

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

export default function Landing() {
  const [auth, setAuth] = useState<any>(null);
  const [reviewedMembers, setReviewedMembers] = useState<string[]>([]);
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
        checkReviewed(token);
      } else {
        localStorage.removeItem("reviewToken");
        window.location.href = "/api/auth/google";
      }
    } catch (err) {
      localStorage.removeItem("reviewToken");
      window.location.href = "/api/auth/google";
    }
  };

  const checkReviewed = async (token: string) => {
    try {
      const res = await fetch("/api/reviews/submit?memberId=test", {
        headers: { "X-Review-Token": token },
      });
      const data = await res.json();
      if (data.reviewedMembers) {
        setReviewedMembers(data.reviewedMembers);
      }
    } catch (err) {
      console.error("Failed to check reviewed members");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    // Clear local token first
    localStorage.removeItem("reviewToken");
    
    // Redirect to Google logout, then to our auth endpoint with account selection prompt
    const googleLogoutUrl = `https://accounts.google.com/logout?continue=${encodeURIComponent("https://jaknyfe.zo.space/api/auth/google?prompt=select_account")}`;
    window.location.href = googleLogoutUrl;
  };

  if (!auth || loading) {
    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p style={{ color: AZ_BLUE }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const userEmail = auth.email?.toLowerCase() || "";
  const selfMember = members.find(m => m.email.toLowerCase() === userEmail);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${AZ_BLUE}20, ${AZ_RED}20, ${AZ_GOLD}15)` }}>
      <div style={{ background: `linear-gradient(135deg, ${AZ_BLUE}, ${AZ_RED})` }} className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-white">Arizona DeMolay 360° Review</h1>
          <p className="text-center text-white mt-2 opacity-90">State Association Member Evaluation</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: AZ_GOLD, color: AZ_BLUE }}>
              {auth.name?.[0]}
            </div>
            <div>
              <p className="font-semibold" style={{ color: AZ_BLUE }}>{auth.name}</p>
              <p className="text-sm" style={{ color: AZ_COPPER }}>{auth.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ background: AZ_RED }}
          >
            Logout
          </button>
        </div>

        <p className="text-center mb-8 text-lg" style={{ color: AZ_BLUE }}>Select a member to review their performance</p>

        {selfMember && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border-l-4" style={{ borderColor: AZ_RED }}>
            <p className="font-semibold" style={{ color: AZ_RED }}>Your self-review is disabled</p>
            <p className="text-sm" style={{ color: AZ_COPPER }}>You cannot review yourself. Your review data will be shown in the results.</p>
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
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-400">
                      <Lock className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-600">{member.name}</h3>
                  <p className="text-sm mb-3 text-gray-500">{member.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Self-review disabled</span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={member.id}
                to={`/review/${member.id}`}
                className={`rounded-xl p-4 bg-white shadow-lg transition-all hover:scale-105 ${isReviewed ? "opacity-80" : ""}`}
                style={{ border: isReviewed ? `2px solid ${AZ_GOLD}` : "2px solid transparent" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: isReviewed ? "#fbbf24" : AZ_GOLD, color: AZ_BLUE }}>
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  {isReviewed && (
                    <div className="p-1 rounded-full bg-green-500">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg" style={{ color: AZ_BLUE }}>{member.name}</h3>
                <p className="text-sm mb-3" style={{ color: AZ_COPPER }}>{member.title}</p>
                <div className="flex items-center gap-1 text-sm" style={{ color: isReviewed ? "#16a34a" : AZ_GOLD }}>
                  <Star className="w-4 h-4 fill-current" />
                  <span>{isReviewed ? "Reviewed" : "Click to review"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
