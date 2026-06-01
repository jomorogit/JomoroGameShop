import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: May 30, 2026</p>

      <p className="mb-6 leading-relaxed">
        We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how JomoroGameShop (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and safeguards your information when you visit our website https://your-domain.com (the &quot;Service&quot;).
      </p>

      <p className="mb-8 leading-relaxed">
        Please read this Privacy Policy carefully. We process your personal data in strict compliance with the General Data Protection Regulation (GDPR) (EU) 2016/679, the California Consumer Privacy Act (CCPA/CPRA), and other applicable data protection laws.
      </p>

      <hr className="border-gray-800 my-8" />

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Definitions</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable individual.</li>
          <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data. For this Service, the Data Controller is JomoroGameShop.</li>
          <li><strong>Subprocessor:</strong> Third-party service providers used by us to process data on our behalf (e.g., payment gateways, analytics providers).</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect and How We Collect It</h2>
        <p className="mb-4 leading-relaxed">
          We only collect data that is strictly necessary for the proper functioning of our Service, following the principle of data minimization.
        </p>
        
        <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Information You Provide to Us Directly</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
          <li><strong>Account Data:</strong> Username and email address when you register an account or communicate with us.</li>
          <li><strong>Profile Data:</strong> User profile avatar URL retrieved when you choose to log in via third-party providers such as Google OAuth.</li>
        </ul>

        <h3 className="text-lg font-medium text-white mt-4 mb-2">B. Information Collected Automatically</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
          <li><strong>Usage and Technical Data:</strong> IP address, browser type, operating system, and device identifiers collected when you access the website.</li>
          <li><strong>Cookies and Tracking:</strong> We use Google Analytics to analyze website traffic. This service sets cookies to track user interactions on our platform.</li>
        </ul>

        <h3 className="text-lg font-medium text-white mt-4 mb-2">C. Payment Information</h3>
        <p className="leading-relaxed">
          All payments are processed securely by our third-party payment processor, Stripe, Inc. We do not store, collect, or have access to your credit card details or financial credentials. Stripe collects this data directly. We only receive confirmation of the transaction (including Transaction ID, payment status, amount, and date) to grant you access to your purchases.
        </p>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">3. Legal Basis for Processing (GDPR)</h2>
        <p className="mb-4 leading-relaxed">
          If you are located in the European Economic Area (EEA), our legal basis for collecting and using your personal data depends on the specific context:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Performance of a Contract (Art. 6(1)(b) GDPR):</strong> To create your account, handle your orders, and provide access to purchased digital content or services.</li>
          <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> For displaying your Google avatar and setting non-essential tracking cookies via Google Analytics. You can withdraw your consent at any time.</li>
          <li><strong>Legal Obligation (Art. 6(1)(c) GDPR):</strong> To retain transaction and financial records for tax, accounting, and anti-fraud compliance.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">4. Data Sharing and Third-Party Subprocessors</h2>
        <p className="mb-4 leading-relaxed">
          We do not sell, rent, or trade your personal data. We share information only with trusted subprocessors necessary to operate our Service:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Stripe, Inc.:</strong> Used for payment processing. Their privacy policy can be accessed at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://stripe.com/privacy</a></li>
          <li><strong>Google LLC:</strong> Used for Google OAuth user authentication and website traffic analysis via Google Analytics. Their privacy policy can be accessed at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://policies.google.com/privacy</a></li>
          <li><strong>Cloudflare, Inc.:</strong> Used for website security, DDoS protection, and bot management via Turnstile. Their privacy policy can be accessed at <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://www.cloudflare.com/privacypolicy/</a></li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">5. International Data Transfers</h2>
        <p className="leading-relaxed">
          Because our subprocessors (such as Stripe and Google) are located in the United States, your personal data may be transferred to and processed outside the EEA. We ensure that these transfers are protected by appropriate safeguards, such as Standard Contractual Clauses (SCCs) approved by the European Commission, ensuring an adequate level of data protection.
        </p>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention and Anonymization</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Account Data:</strong> Retained as long as your account is active. If you request account deletion, your personal data (email, name, avatar) will be permanently deleted from our production databases within 30 days.</li>
          <li><strong>Financial and Transaction Logs:</strong> To comply with tax and statutory laws, records of transactions (including amount, date, and item ID) will be preserved for up to 10 years. However, this data will be completely anonymized and severed from your personal identifiers, meaning it cannot be linked back to any individual.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">7. Childrens Privacy</h2>
        <p className="leading-relaxed">
          Our Service is not intended for children under the age of 13 (in the United States) or under 16 (in the European Union). We do not knowingly collect personal data from children. If we discover that a child under these ages has provided us with personal data, we will delete it immediately from our servers. If you are a parent or guardian and believe your child provided us with data, please contact us.
        </p>
      </section>

      {/* Section 8 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">8. Your Rights Under GDPR</h2>
        <p className="mb-4 leading-relaxed">If you are a resident of the EEA, you have the following data protection rights:</p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Right of Access and Portability:</strong> The right to request a copy of your personal data in a structured, machine-readable format.</li>
          <li><strong>Right to Rectification:</strong> The right to request the correction of inaccurate information.</li>
          <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> The right to request the complete deletion of your personal data.</li>
          <li><strong>Right to Restrict or Object to Processing:</strong> The right to object to or restrict how we handle your data under certain circumstances.</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">9. California Privacy Rights (CCPA/CPRA Disclosure)</h2>
        <p className="mb-4 leading-relaxed">Under the California Consumer Privacy Act, California residents are entitled to specific rights:</p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><strong>Right to Know:</strong> Request details about the categories and specific pieces of personal data collected and shared.</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal data collected.</li>
          <li><strong>No Sale of Data:</strong> We explicitly declare that we do not sell, share, or rent your personal information to third parties for monetary or commercial gain.</li>
          <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
        <p className="mb-2 leading-relaxed">To exercise any of your rights (such as requesting a data export or account deletion), or if you have any questions regarding this Privacy Policy, please contact us at:</p>
        <p className="font-medium text-white">Email: <a href="mailto:jomoroforwork@gmail.com" className="text-blue-400 hover:underline">jomoroforwork@gmail.com</a></p>
      </section>
    </main>
  );
}