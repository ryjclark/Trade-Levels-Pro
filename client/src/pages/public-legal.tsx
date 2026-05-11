import "./public.css";
import PublicNav from "@/components/public-nav";
import PublicFooter from "@/components/public-footer";
import { CONTACT_EMAIL } from "@/lib/constants";

interface LegalPageProps {
  kind: "terms" | "privacy" | "risk";
}

export default function PublicLegalPage({ kind }: LegalPageProps) {
  const content = LEGAL_CONTENT[kind];
  return (
    <div className="public-page">
      <div className="public-container">
        <PublicNav />
        <section className="public-hero" style={{ padding: "80px 0 40px" }}>
          <div className="public-hero-content">
            <h1>{content.title}</h1>
            <p className="public-hero-subtitle">Last updated: May 11, 2026</p>
          </div>
        </section>
        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="public-info-box legal-box">
            {content.body.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
        </section>
        <PublicFooter />
      </div>
    </div>
  );
}

const LEGAL_CONTENT: Record<
  "terms" | "privacy" | "risk",
  { title: string; body: string[] }
> = {
  terms: {
    title: "Terms of Service",
    body: [
      "Welcome to Trade Levels Pro. By accessing or using this website and the private Telegram channel (the &ldquo;Service&rdquo;), you agree to these Terms of Service. If you do not agree, do not use the Service.",
      "<strong>Service description.</strong> Trade Levels Pro publishes a daily, educational ES futures trade plan with key levels, bias, and example setups. The Service is intended for traders who already understand the futures market.",
      "<strong>No investment advice.</strong> All content is provided for educational and informational purposes only. Nothing in the Service constitutes investment advice, a recommendation, or a solicitation to buy or sell any security or derivative. You are solely responsible for your trading decisions and outcomes.",
      "<strong>Subscription and access.</strong> Access is provided through a recurring monthly subscription. You may cancel at any time. Membership grants a personal, non-transferable right to use the published plans; you may not redistribute, resell, or share the content.",
      "<strong>Acceptable use.</strong> You agree not to misuse the Service, attempt to gain unauthorized access, or share access credentials. We may suspend or terminate accounts that violate these terms.",
      "<strong>Limitation of liability.</strong> To the fullest extent permitted by law, Trade Levels Pro and its operators are not liable for any losses, damages, or costs arising from your use of, or inability to use, the Service.",
      `<strong>Contact.</strong> Questions about these terms can be sent to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`,
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "This Privacy Policy explains what information Trade Levels Pro collects and how it is used. By using the Service you consent to the practices described here.",
      "<strong>Information we collect.</strong> When you sign up for previews or subscribe, we collect your email address and basic subscription metadata (such as start date and status). We do not collect financial account information &mdash; payments are handled by our third-party payment processor.",
      "<strong>How we use information.</strong> We use your email to deliver the Service, send transactional notifications, and occasionally share updates about the plan. We do not sell your personal information.",
      "<strong>Cookies and analytics.</strong> The website may use minimal cookies and privacy-respecting analytics to understand traffic and improve the experience. You can disable cookies in your browser without losing access to the core Service.",
      "<strong>Third parties.</strong> We rely on trusted vendors to operate the Service, including a payment processor and Telegram for content delivery. These vendors process limited data on our behalf under their own privacy terms.",
      "<strong>Your rights.</strong> You can request access to, correction of, or deletion of your personal data at any time. Cancelling your subscription does not automatically delete historical records.",
      `<strong>Contact.</strong> Privacy requests can be sent to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`,
    ],
  },
  risk: {
    title: "Risk Disclaimer",
    body: [
      "<strong>Trading futures involves substantial risk and is not suitable for every investor.</strong> You can lose more than your initial deposit. Before trading, carefully consider your financial condition, objectives, and risk tolerance.",
      "<strong>Educational content only.</strong> Trade Levels Pro publishes daily plans, levels, and example setups for educational purposes. Nothing published constitutes investment advice, a personal recommendation, or a guarantee of any specific outcome.",
      "<strong>No performance guarantees.</strong> Past performance is not indicative of future results. Hypothetical or example setups have inherent limitations and do not represent actual trading. Your results will differ.",
      "<strong>Your responsibility.</strong> You alone are responsible for your trading decisions, position sizing, risk management, broker selection, and compliance with the rules of any prop firm or trading platform you use.",
      "<strong>Not a fiduciary.</strong> Trade Levels Pro is not a registered investment adviser, broker-dealer, or commodity trading adviser. No fiduciary relationship is created by your use of the Service.",
      "If you do not understand the risks of trading futures, consult a qualified financial professional before participating in the markets.",
    ],
  },
};
