import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { FC, useEffect, useState } from 'react'
import { CustomToolbar } from './CustomToolbar'

// 👇 Import Quill to access the font format
import Quill from 'quill'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

const formats = [
  'font', 'color', 'bold', 'italic', 'underline',
  'link', 'code-block', 'clean', 'image',
  'list', 'bullet', 'blockquote',
  'align',
]

const modules = {
  toolbar: {
    container: '#custom-toolbar',
  },
}

const Editor: FC<EditorProps> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    const Font = Quill.import('formats/font');
    Font.whitelist = ['sans-serif', 'serif', 'monospace']
    Quill.register(Font, true);
  }, [])

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (val: string) => {
    setInternalValue(val)
    onChange(val)
  }

  return (
    <div className="rounded-lg space-y-2 bg-gray-100 p-3 max-h-[350px] overflow-y-auto">
      <CustomToolbar />
      <ReactQuill
        value={internalValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        className="border-none rounded-md text-sm bg-white"
        theme="snow"
        placeholder="Write job description here"
      />
    </div>
  )
}

export default Editor
