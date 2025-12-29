"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AboutLayout from "@/app/components/about/AboutLayout";

function AboutContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "about";

    return (
        <AboutLayout activeTab={tab}>
            {tab === "about" && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">About Us</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                        <p>
                            Welcome to Arashi, where style meets enhanced comfort. We are dedicated to providing
                            premium essentials that elevate your everyday wardrobe. Our journey began with a simple
                            idea: to create clothing that looks good and feels even better.
                        </p>
                        <p>
                            We believe in quality craftsmanship, sustainable practices, and designs that stand the
                            test of time. Every piece in our collection is thoughtfully curated to ensure it meets
                            our high standards of excellence.
                        </p>
                        <p>
                            Thank you for being part of our story. We look forward to continuing to serve you with
                            the best in fashion and lifestyle products.
                        </p>
                    </div>
                </div>
            )}

            {tab === "terms" && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                        <p><strong>Last Updated: December 2025</strong></p>
                        <p>
                            Welcome to Arashi. By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900">1. Use License</h3>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on Arashi&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on Arashi&apos;s website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials; or</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">2. Disclaimer</h3>
                        <p>
                            The materials on Arashi&apos;s website are provided on an &apos;as is&apos; basis. Arashi makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900">3. Limitations</h3>
                        <p>
                            In no event shall Arashi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Arashi&apos;s website, even if Arashi or a Arashi authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900">4. Accuracy of Materials</h3>
                        <p>
                            The materials appearing on Arashi&apos;s website could include technical, typographical, or photographic errors. Arashi does not warrant that any of the materials on its website are accurate, complete or current. Arashi may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </div>
                </div>
            )}

            {tab === "policy" && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                        <p><strong>Last Updated: December 2025</strong></p>
                        <p>
                            Your privacy is important to us. It is Arashi&apos;s policy to respect your privacy regarding any information we may collect from you across our website.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900">1. Information We Collect</h3>
                        <p>
                            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
                        </p>
                        <p>
                            We may collect the following types of information:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, shipping address.</li>
                            <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely by our payment providers).</li>
                            <li><strong>Usage Data:</strong> Information on how you interact with our website, including pages visited and time spent.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h3>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide, operate, and maintain our website;</li>
                            <li>Process your transactions and manage your orders;</li>
                            <li>Send you emails regarding your order status, new products, and special offers (you can opt-out at any time);</li>
                            <li>Improve, personalize, and expand our website;</li>
                            <li>Understand and analyze how you use our website.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">3. Information Sharing</h3>
                        <p>
                            We do not share your personal information publicly or with third-parties, except when required to by law. We may share information with third-party service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-900">4. Security</h3>
                        <p>
                            We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                        </p>
                    </div>
                </div>
            )}
        </AboutLayout>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AboutContent />
        </Suspense>
    );
}
