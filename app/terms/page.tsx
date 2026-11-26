import Link from 'next/link';
import { FiEdit3, FiArrowLeft } from 'react-icons/fi';

export default function TermsPage() {
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
              Terms & Conditions
            </h1>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Notes Manager, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, please do not
                use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily use Notes Manager for personal, non-commercial
                use only. This is the grant of a license, not a transfer of title, and under this
                license you may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. User Account
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and
                password. You agree to accept responsibility for all activities that occur under
                your account. You must notify us immediately of any unauthorized use of your
                account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. User Content
              </h2>
              <p>
                You retain all rights to the content you create and store in Notes Manager. By
                using our service, you grant us permission to store, process, and display your
                content solely for the purpose of providing the service to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Prohibited Uses
              </h2>
              <p>You may not use Notes Manager:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any harmful, offensive, or illegal content</li>
                <li>To impersonate or attempt to impersonate another user</li>
                <li>To engage in any automated use of the system</li>
                <li>To interfere with or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Service Availability
              </h2>
              <p>
                We strive to provide continuous service availability but do not guarantee
                uninterrupted access. We reserve the right to modify or discontinue the service at
                any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Limitation of Liability
              </h2>
              <p>
                Notes Manager shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use or inability to use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                8. Termination
              </h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for any
                breach of these Terms. Upon termination, your right to use the service will
                immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                9. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes. Your continued use of the service after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms, please contact us through our{' '}
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
