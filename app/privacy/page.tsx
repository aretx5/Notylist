import Link from 'next/link';
import { FiEdit3, FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:underline mb-8">
          <FiArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <FiEdit3 className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Information We Collect
              </h2>
              <p>
                When you use Notes Manager, we collect the following information:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Account Information:</strong> Username, email address, and password
                  (encrypted)
                </li>
                <li>
                  <strong>Content:</strong> Notes, categories, and other data you create
                </li>
                <li>
                  <strong>Usage Data:</strong> Login times, feature usage, and preferences
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type, and device information
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide and maintain our service</li>
                <li>Authenticate your identity and secure your account</li>
                <li>Send you important service updates and notifications</li>
                <li>Improve and optimize our service</li>
                <li>Respond to your requests and support needs</li>
                <li>Detect and prevent fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Data Storage and Security
              </h2>
              <p>
                We take data security seriously. Your password is encrypted using industry-standard
                encryption. Your notes and personal data are stored securely in our database with
                appropriate security measures including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure password hashing with bcrypt</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Automated backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Data Sharing
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We only
                share your information when:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You explicitly choose to share notes publicly or with specific users</li>
                <li>Required by law or legal process</li>
                <li>Necessary to protect our rights or the safety of our users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data at any time</li>
                <li>Update or correct your information</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of non-essential communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Cookies and Tracking
              </h2>
              <p>
                We use essential cookies to maintain your session and provide authentication. These
                cookies are necessary for the service to function and cannot be disabled. We do not
                use advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Data Retention
              </h2>
              <p>
                We retain your data as long as your account is active. When you delete your account,
                all your data is permanently removed from our servers within 30 days. Notes in trash
                are automatically deleted after 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                8. Children's Privacy
              </h2>
              <p>
                Notes Manager is not intended for children under 13 years of age. We do not
                knowingly collect personal information from children. If we learn that we have
                collected information from a child under 13, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                9. Changes to Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by email or through the service. Your continued use after such
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10. Contact Us
              </h2>
              <p>
                If you have questions or concerns about this Privacy Policy or how we handle your
                data, please contact us through our{' '}
                <Link href="/contact" className="text-purple-600 hover:underline">
                  Contact Page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
