export function QuickButtons({ onClick }: { onClick: (question: string) => void }) {
  const questions = [
    "Udyam Registration कैसे करें?",
    "MSME के लिए कौन से लोन उपलब्ध हैं?",
    "GST return कैसे भरें?",
    "PMEGP scheme की पूरी जानकारी दें",
    "ZED certification क्या है?",
    "मेरी कंपनी MSME में register है या नहीं?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-4">
      <p className="text-sm text-orange-700 font-medium mb-3 text-center">
        लोकप्रिय सवाल – एक क्लिक में जवाब पाएं
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onClick(q)}
            className="text-left p-4 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-medium text-sm shadow-md hover:shadow-xl transition-all border border-orange-300"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
