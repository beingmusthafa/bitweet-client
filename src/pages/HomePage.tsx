import Layout from "@/components/global/Layout";

export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Twitter Clone
          </h2>
          <p className="text-gray-600">
            Your Twitter-like social media experience starts here!
          </p>
        </div>
      </div>
    </Layout>
  );
}
