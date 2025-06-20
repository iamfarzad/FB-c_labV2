import { TextParticle } from "@/components/ui/text-particle"

export default function TextParticles() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Text Particle Animation</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Interactive text made of particles that react to mouse movement
        </p>

        <div className="h-64 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <TextParticle
            text="Vercel"
            fontSize={150}
            particleColor="#3b82f6"
            particleSize={1}
            particleDensity={5}
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <TextParticle
              text="Next.js"
              fontSize={100}
              particleColor="#f43f5e"
              particleSize={1}
              particleDensity={8}
              backgroundColor="#111827"
              className="bg-gray-900"
            />
          </div>

          <div className="h-48 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <TextParticle
              text="Designali"
              fontSize={60}
              particleColor="#10b981"
              particleSize={1}
              particleDensity={4}
              className="bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to Use</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
            <code className="text-gray-800 dark:text-gray-200">
{`import { TextParticle } from "@/components/ui/text-particle"

// Basic usage
<TextParticle
  text="Your Text"
  fontSize={80}
  particleColor="#000000"
  particleSize={2}
  particleDensity={8}
  backgroundColor="transparent"
  className="w-full h-64"
/>`}
            </code>
          </pre>
        </div>
      </div>
    </main>
  )
}
