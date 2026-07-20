import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="border-t border-[#e5ddc8] bg-white py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 md:px-10 lg:px-16 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Link to="/" className="text-xl font-black tracking-tight text-[#2f5233]">
            Heritage<span className="text-[#d4af37]">AI</span>
          </Link>
          <p className="max-w-sm text-xs font-light leading-relaxed text-gray-500">
            Empowering communities to transcribe, translate, and preserve oral histories, folk knowledge, and elder wisdom using advanced synthesis architectures.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Explore Platform</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/library" className="font-medium text-gray-600 transition hover:text-[#2f5233]">Heritage Library</Link></li>
            <li><Link to="/analytics" className="font-medium text-gray-600 transition hover:text-[#2f5233]">Regional Analytics</Link></li>
            <li><Link to="/chat" className="font-medium text-gray-600 transition hover:text-[#2f5233]">AI Cultural Chat</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Get Involved</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/interview" className="font-medium text-gray-600 transition hover:text-[#2f5233]">Start Oral Interview</Link></li>
            <li><Link to="/about" className="font-medium text-gray-600 transition hover:text-[#2f5233]">About Our Project</Link></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 transition hover:text-[#2f5233]">Developer API</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
