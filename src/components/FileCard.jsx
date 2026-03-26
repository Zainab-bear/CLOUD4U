import { motion } from "framer-motion"

export default function FileCard({ file, onDelete, onStar, onClick }) {
  const getIcon = () => {
    if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) return "🖼️"
    if (file.name.match(/\.pdf$/i)) return "📄"
    if (file.name.match(/\.(js|html|css|json|txt)$/i)) return "💻"
    return "📁"
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5 }}
      className="bg-white/70 p-4 rounded-2xl shadow cursor-pointer"
    >
      <div className="text-4xl">{getIcon()}</div>
      <h2>{file.name}</h2>

      <div className="flex justify-between mt-3">
        <button onClick={(e) => { e.stopPropagation(); onStar(file.id) }}>
          {file.starred ? "⭐" : "☆"}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(file.id) }}>
          🗑️
        </button>
      </div>
    </motion.div>
  )
}