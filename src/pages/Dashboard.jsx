import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { foldersDB, binDB } from "../mockData"
import FileCard from "../components/FileCard"
import toast from "react-hot-toast"
import api from "../api"

export default function Dashboard() {
  const [folders, setFolders] = useState(foldersDB)
  const [currentFolder, setCurrentFolder] = useState(foldersDB[0])
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // 🔥 create preview URL properly
  useEffect(() => {
    if (selectedFile?.file) {
      const url = URL.createObjectURL(selectedFile.file)
      setPreviewUrl(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  // 📡 Load real files from backend on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get("/api/files")

        const mapped = data.map((f) => ({
          id: f.id,
          name: f.filename,
          starred: false,
        }))

        setFolders((prev) =>
          prev.map((folder, i) =>
            i === 0 ? { ...folder, files: mapped } : folder
          )
        )
        setCurrentFolder((prev) => (prev.id === foldersDB[0].id ? { ...prev, files: mapped } : prev))
      } catch (err) {
        console.error("Failed to load files:", err)
      }
    }

    fetchFiles()
  }, [])

  // CREATE FOLDER
  const createFolder = () => {
    const name = prompt("Folder name:")
    if (!name) return

    const newFolder = { id: Date.now(), name, files: [] }
    const updated = [...folders, newFolder]
    setFolders(updated)
  }

  // UPLOAD
  const handleFile = async (file) => {
    if (!file) return

    try {
      // 1. Get presigned upload URL from backend
      const { data: presignData } = await api.post("/api/presign", {
        filename: file.name,
        contentType: file.type,
      })

      // 2. Upload file directly to S3 via presigned URL
      await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      // 3. Save file metadata to backend database
      await api.post("/api/files", {
        filename: file.name,
        objectKey: presignData.objectKey,
      })

      // 4. Update local state so UI reflects the new file immediately
      const newFile = {
        id: Date.now(),
        name: file.name,
        file,
        starred: false,
      }

      const updatedFolders = folders.map((folder) => {
        if (folder.id === currentFolder.id) {
          return { ...folder, files: [...folder.files, newFile] }
        }
        return folder
      })

      setFolders(updatedFolders)
      setCurrentFolder(updatedFolders.find((f) => f.id === currentFolder.id))

      // 5. Success toast
      toast.success("Uploaded 🚀")
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Upload failed — please try again")
    }
  }

  // DELETE
  const deleteFile = (id) => {
    const file = currentFolder.files.find(f => f.id === id)
    binDB.push(file)

    const updatedFolders = folders.map(folder => {
      if (folder.id === currentFolder.id) {
        return {
          ...folder,
          files: folder.files.filter(f => f.id !== id)
        }
      }
      return folder
    })

    setFolders(updatedFolders)
    setCurrentFolder(updatedFolders.find(f => f.id === currentFolder.id))
  }

  // ⭐ FIXED STAR (IMMUTABLE)
  const starFile = (id) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === currentFolder.id) {
        return {
          ...folder,
          files: folder.files.map(file =>
            file.id === id
              ? { ...file, starred: !file.starred }
              : file
          )
        }
      }
      return folder
    })

    setFolders(updatedFolders)
    setCurrentFolder(updatedFolders.find(f => f.id === currentFolder.id))
  }

  return (
    <Layout>

      {/* TOP */}
      <div className="flex justify-between mb-6">
        <h2 className="text-xl">{currentFolder.name}</h2>

        <div className="space-x-3">
          <button onClick={createFolder} className="bg-blue-500 text-white px-3 py-1 rounded">
            + Folder
          </button>

          <label className="bg-purple-500 text-white px-3 py-1 rounded cursor-pointer">
            Upload
            <input type="file" hidden onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        </div>
      </div>

      {/* FOLDERS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {folders.map(folder => (
          <div
            key={folder.id}
            onClick={() => setCurrentFolder(folder)}
            className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-purple-50"
          >
            📁 {folder.name}
          </div>
        ))}
      </div>

      {/* DRAG DROP */}
      <div
        onDrop={(e) => {
          e.preventDefault()
          handleFile(e.dataTransfer.files[0])
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-purple-300 rounded-2xl p-10 text-center mb-6"
      >
        Drag & Drop files here
      </div>

      {/* FILES */}
      <div className="grid grid-cols-3 gap-6">
        {currentFolder.files.map(file => (
          <FileCard
            key={file.id}
            file={file}
            onDelete={deleteFile}
            onStar={starFile}
            onClick={() => setSelectedFile(file)}
          />
        ))}
      </div>

      {/* 🔥 PREVIEW FIXED */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex flex-col z-50">

          <div className="flex justify-between p-4 text-white">
            <h2>{selectedFile.name}</h2>

            <div className="space-x-4">
              <a href={previewUrl} download={selectedFile.name} className="underline">
                Download
              </a>
              <button onClick={() => setSelectedFile(null)}>✕</button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">

            {/* IMAGE */}
            {selectedFile.file.type.startsWith("image/") && (
              <img src={previewUrl} className="max-h-full rounded-xl" />
            )}

            {/* PDF */}
            {selectedFile.file.type === "application/pdf" && (
              <iframe src={previewUrl} className="w-full h-full bg-white rounded-xl" />
            )}

            {/* TEXT */}
            {selectedFile.file.type.startsWith("text/") && (
              <TextPreview file={selectedFile.file} />
            )}

            {/* OTHER */}
            {!selectedFile.file.type.startsWith("image/") &&
             selectedFile.file.type !== "application/pdf" &&
             !selectedFile.file.type.startsWith("text/") && (
              <p className="text-white">Preview not supported — download file</p>
            )}

          </div>
        </div>
      )}

    </Layout>
  )
}

/* TEXT PREVIEW */
function TextPreview({ file }) {
  const [text, setText] = useState("")

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => setText(e.target.result)
    reader.readAsText(file)
  }, [file])

  return (
    <pre className="bg-white text-black p-4 rounded-xl max-h-full overflow-auto">
      {text}
    </pre>
  )
}