import Layout from "../components/Layout"
import { useState } from "react"
import { filesDB, binDB } from "../mockData"
import toast from "react-hot-toast"

export default function Bin() {
  const [files, setFiles] = useState(binDB)

  const restoreFile = (id) => {
    const file = binDB.find(f => f.id === id)
    filesDB.push(file)

    const updated = binDB.filter(f => f.id !== id)
    binDB.length = 0
    binDB.push(...updated)

    setFiles([...binDB])
    toast.success("File restored ♻️")
  }

  const deletePermanent = (id) => {
    const updated = binDB.filter(f => f.id !== id)
    binDB.length = 0
    binDB.push(...updated)

    setFiles([...binDB])
    toast("Deleted permanently ❌")
  }

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-6">Bin</h2>

      {files.length === 0 ? (
        <p className="text-gray-500">No deleted files</p>
      ) : (
        <div className="space-y-4">
          {files.map(file => (
            <div key={file.id} className="bg-white/70 p-4 rounded-xl flex justify-between shadow">
              <span>{file.name}</span>

              <div className="space-x-3">
                <button onClick={() => restoreFile(file.id)} className="text-green-600">
                  Restore
                </button>
                <button onClick={() => deletePermanent(file.id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}