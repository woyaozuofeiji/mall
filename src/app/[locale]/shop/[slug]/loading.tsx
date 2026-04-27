export default function ProductLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 126, 149, 0.2);
          border-top-color: #ff7e95;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
