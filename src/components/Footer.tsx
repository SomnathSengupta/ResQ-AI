const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">

        {/* Project Info */}
        <div>
          <h1 className="text-2xl font-bold text-blue-400">ResQAI</h1>
          <p className="mt-3 text-gray-400 text-sm">
            AI-powered disaster information aggregation and response system. 
            Helping save lives through real-time intelligence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Quick Links</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-blue-400 cursor-pointer transition">Home</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Features</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Workflow</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Contact</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Resources</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="hover:text-blue-400 cursor-pointer transition">Documentation</li>
            <li className="hover:text-blue-400 cursor-pointer transition">API</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Support</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Privacy Policy</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Contact</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Email: support@resqai.com</li>
            <li>Location: India</li>
            <li className="flex gap-4 mt-3">
              <span className="hover:text-blue-400 cursor-pointer transition">🌐</span>
              <span className="hover:text-blue-400 cursor-pointer transition">🐦</span>
              <span className="hover:text-blue-400 cursor-pointer transition">💼</span>
              <span className="hover:text-blue-400 cursor-pointer transition">📷</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-slate-700 text-center py-4 text-gray-400 text-sm">
        © 2026 ResQAI. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;