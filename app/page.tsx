import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Ask Ahoy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/upload">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Transform Your Documents Into Interactive Quiz Experiences
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Upload your documents, and we&apos;ll convert them into engaging
                quiz and trivia experiences. Perfect for training, education, or
                engaging your audience.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/upload">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link
                  href="#examples"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Simple process to create engaging quiz experiences
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Upload Documents
                </h3>
                <p className="mt-4 text-gray-600">
                  Upload your PDF, DOCX, or text files. We&apos;ll extract the
                  content and prepare it for conversion.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. AI Processing
                </h3>
                <p className="mt-4 text-gray-600">
                  Our AI analyzes your content and creates engaging quiz
                  questions with multiple choice answers.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Share & Engage
                </h3>
                <p className="mt-4 text-gray-600">
                  Receive a unique URL for your quiz experience. Share it with
                  your audience and track engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Upload your first document and see how easy it is to create
                engaging quiz experiences.
              </p>
              <div className="mt-10">
                <Link href="/upload">
                  <Button size="lg">Start Creating</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ask Ahoy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
