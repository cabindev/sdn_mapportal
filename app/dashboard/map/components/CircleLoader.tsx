// app/dashboard/map/components/CircleLoader.tsx
export default function CircleLoader({ message = "กำลังโหลด..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white bg-opacity-80">
      <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      <p className="mt-4 text-slate-600 font-medium">{message}</p>
    </div>
  )
}