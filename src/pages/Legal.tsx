import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Legal Information</h1>
          <p className="text-muted-foreground">End User License Agreement & Privacy Policy</p>
        </div>

        <div className="grid gap-8">
          {/* EULA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">End User License Agreement (EULA)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Effective Date: Sept 9/2025 | App Name: MBP | Company: Missed a spot inc.
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                    <p className="text-muted-foreground">
                      By downloading, installing, or using this application ("App"), you agree to be bound by the terms of this End User License Agreement ("Agreement"). If you do not agree, do not install or use the App.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">2. License Grant</h3>
                    <p className="text-muted-foreground">
                      We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for your internal business purposes. You may not resell, distribute, or sublicense the App.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">3. Restrictions</h3>
                    <p className="text-muted-foreground mb-2">You agree not to:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Reverse engineer, decompile, or disassemble the App. Circumvent security or usage restrictions. Use the App in violation of applicable laws.</li>
                      <li>Misuse the App to process data you are not legally authorized to access.</li>
                    </ul>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">4. Integration with QuickBooks Online</h3>
                    <p className="text-muted-foreground mb-2">
                      The App connects to QuickBooks Online ("QBO") through Intuit's API. By using the App, you acknowledge and agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>You must have an active QBO account.</li>
                      <li>Data access is subject to Intuit's terms of service and privacy policy.</li>
                      <li>We are not responsible for errors, outages, or limitations in QBO or Intuit's services.</li>
                    </ul>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">5. Data Use and Privacy</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>The App may access, process, and display data retrieved from your QBO account.</li>
                      <li>We do not sell your data.</li>
                      <li>You are responsible for ensuring compliance with privacy and data protection regulations applicable to your business.</li>
                      <li>Please review our Privacy Policy for full details.</li>
                    </ul>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">6. Ownership</h3>
                    <p className="text-muted-foreground">
                      All rights, title, and interest in the App, including intellectual property rights, remain with us. This Agreement does not transfer any ownership rights.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">7. Updates and Changes</h3>
                    <p className="text-muted-foreground">
                      We may provide updates, bug fixes, or enhancements. These are subject to the terms of this Agreement. Features may change without notice.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">8. Disclaimer of Warranties</h3>
                    <p className="text-muted-foreground">
                      The App is provided "as is" and "as available." We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the App will be error-free, secure, or uninterrupted.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">9. Limitation of Liability</h3>
                    <p className="text-muted-foreground mb-2">To the maximum extent permitted by law:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>We are not liable for any indirect, incidental, special, or consequential damages.</li>
                      <li>Our total liability for direct damages will not exceed the fees you paid for the App in the past 12 months.</li>
                    </ul>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">10. Termination</h3>
                    <p className="text-muted-foreground">
                      We may suspend or terminate your access to the App if you violate this Agreement. Upon termination, you must stop using and uninstall the App.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">11. Governing Law</h3>
                    <p className="text-muted-foreground">
                      This Agreement is governed by the laws of Ontario, Canada. Any disputes shall be resolved in the courts located in Barrie, Ontario.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">12. Contact Information</h3>
                    <p className="text-muted-foreground mb-1">If you have questions, contact us at:</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Missed a spot inc</p>
                      <p>836 Greer Road. Port Sydney On., P0B1M0</p>
                      <p>
                        <a href="mailto:chad@missedaspot.ca" className="text-primary hover:underline">
                          chad@missedaspot.ca
                        </a>
                      </p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Privacy Policy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground">
                Effective Date: Sept 9/2025 | App Name: MBP | Company: Missed a spot inc
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                    <p className="text-muted-foreground mb-2">When you use our App, we may collect:</p>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Account Data:</strong> Information you provide when creating an account (name, email, business details).</p>
                      <p><strong>QuickBooks Online Data:</strong> Financial and business data accessed through QBO with your consent.</p>
                      <p><strong>Usage Data:</strong> Technical information such as device type, operating system, IP address, and in-app activity.</p>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      We do not collect payment card information directly. Payments, if any, are processed through third-party providers.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">2. How We Use Information</h3>
                    <p className="text-muted-foreground mb-2">We use your data to:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Provide insights and planning features.</li>
                      <li>Sync and display your QBO data.</li>
                      <li>Improve app performance and user experience. Communicate with you regarding support, updates, or notices.</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      We do not sell or rent your data to third parties.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">3. Sharing of Information</h3>
                    <p className="text-muted-foreground mb-2">We may share data only in these circumstances:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li><strong>With Service Providers:</strong> Third parties that help us operate the App (e.g., cloud hosting, analytics).</li>
                      <li><strong>With Intuit (QBO):</strong> As required for syncing your account.</li>
                      <li><strong>For Legal Reasons:</strong> If required by law, subpoena, or government request.</li>
                      <li><strong>Business Transfers:</strong> If we merge, acquire, or sell assets, your information may be transferred.</li>
                    </ul>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">4. Data Security</h3>
                    <p className="text-muted-foreground">
                      We use reasonable administrative, technical, and physical safeguards to protect your data. No method of transmission or storage is 100% secure.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">5. Data Retention</h3>
                    <p className="text-muted-foreground">
                      We retain your information as long as necessary to provide the App and comply with legal obligations. You may request deletion of your account and data at any time.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">6. Your Rights</h3>
                    <p className="text-muted-foreground mb-2">Depending on your jurisdiction, you may have rights to:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Access the data we hold about you.</li>
                      <li>Request corrections or deletion.</li>
                      <li>Withdraw consent to data processing.</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      To exercise rights, contact us at{" "}
                      <a href="mailto:chad@missedaspot.ca" className="text-primary hover:underline">
                        chad@missedaspot.ca
                      </a>
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">7. Third-Party Services</h3>
                    <p className="text-muted-foreground">
                      Our App integrates with QuickBooks Online. Your use of QBO is subject to Intuit's terms and privacy policy. We are not responsible for Intuit's practices.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">8. Children's Privacy</h3>
                    <p className="text-muted-foreground">
                      The App is not intended for individuals under 18. We do not knowingly collect information from children.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">9. Changes to This Policy</h3>
                    <p className="text-muted-foreground">
                      We may update this Privacy Policy from time to time. Updates will be posted in the App or on our website with the effective date.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold mb-2">10. Contact Us</h3>
                    <p className="text-muted-foreground mb-1">For questions or requests, contact:</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Missed a spot inc</p>
                      <p>836 Greer Road, Port Sydney, On., P0B1Mo</p>
                      <p>
                        <a href="mailto:chad@missedaspot.ca" className="text-primary hover:underline">
                          chad@missedaspot.ca
                        </a>
                      </p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;