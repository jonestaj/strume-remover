export function ProgressBar({ percent }) {
  if (percent <= 0 || percent >= 100) return null;
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
      <div className="bg-black h-full transition-all" style={{ width: `${percent}%` }}></div>
    </div>
  );
}
