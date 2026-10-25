import LanguageSelector from './common/LanguageSelector';

export { LanguageSelector };

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0f1c3f] border-b border-gray-200 dark:border-white/10">
      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">YojSetu</div>
      <div className="flex items-center gap-3">
        <LanguageSelector align="right" />
      </div>
    </nav>
  );
}
